import { is } from 'valibot';
import type { Identifier } from '../node/NodeIdentifier.ts';
import { nodeReferenceSchema, type NodeReference } from '../node/NodeReference.ts';
import FrozenNodeSet, { getNodeSetIds } from '../structure/FrozenNodeSet.ts';
import FrozenSet, { isFrozenSet, type ReadWriteSet } from '../structure/FrozenSet.ts';
import type FrozenSkipList from '../structure/FrozenSkipList.ts';
import type { DraftNode } from './DraftNode.ts';
import type { FrozenInternalNode } from './FrozenInternalNode.ts';
import { getIsPartOfIds } from './getPartIds.ts';
import { getDateCreatedTime, stampHiddenNodeState } from './hiddenNodeState.ts';

/**
 * A node being modified in a transaction, i.e. changes made by the store on top of a node (e.g. mirroring `isPartOf`,
 * removing references to a deleted node). It is a plain record, use functions in this module to work on it.
 *
 * - `hasPart` and `isPartOf` of `node` are ignored, `hasPart` is generated from the child IDs passed in, and `isPartOf`
 *   is kept in `partOfIds`
 * - If `node` is not frozen (i.e. created by `createNode()`), the draft owns it and could modify it in place
 * - If `node` is frozen (i.e. in the graph or handed to userland), it is never modified, it is copied on write
 *
 * The record is mutable and must never be exposed to userland.
 */
type Draft = {
  readonly dateCreatedTime: number;
  readonly id: Identifier;
  node: DraftNode | FrozenInternalNode;
  /** `isPartOf` before changes in `partOfOverlay`. */
  partOfIds: FrozenSet<Identifier>;
  /** Changes to `isPartOf` since `partOfIds` is taken, `undefined` if unchanged. */
  partOfOverlay: ReadWriteSet<Identifier> | undefined;
};

type NodeObject = Record<string, unknown>;

function isReferenceTo(id: Identifier, value: unknown): value is NodeReference {
  return is(nodeReferenceSchema, value) && value['@id'] === id;
}

/**
 * Whether the property could contain node references other than `hasPart` and `isPartOf`, i.e. property values.
 */
function isReferenceProperty(key: string, value: unknown): value is readonly unknown[] {
  return key !== '@context' && key !== '@id' && key !== '@type' && Array.isArray(value);
}

function isPartProperty(key: string): key is 'hasPart' | 'isPartOf' {
  return key === 'hasPart' || key === 'isPartOf';
}

/** Reuses the `FrozenNodeSet` if it has the same IDs object, so unchanged parts keep the same identity. */
function toNodeSet(currentValue: unknown, ids: FrozenSet<Identifier>): FrozenNodeSet {
  return getNodeSetIds(currentValue) === ids
    ? (currentValue satisfies unknown as FrozenNodeSet)
    : new FrozenNodeSet(ids);
}

/**
 * Builds a new unfrozen plain object of the node with `hasPart` and `isPartOf` replaced, empty ones are omitted.
 *
 * This is O(number of properties), regardless of the number of parts. Properties are kept in the same order, new
 * `hasPart` and `isPartOf` are appended.
 */
function buildNode(node: object, parentIds: FrozenSet<Identifier>, childIds: FrozenSet<Identifier>): NodeObject {
  const getPartValue = (key: string, value: unknown): FrozenNodeSet | undefined => {
    const ids = key === 'hasPart' ? childIds : parentIds;

    return ids.size ? toNodeSet(value, ids) : undefined;
  };

  const nextNode: NodeObject = {};

  for (const [key, value] of Object.entries(node)) {
    const nextValue = isPartProperty(key) ? getPartValue(key, value) : value;

    // eslint-disable-next-line security/detect-object-injection
    typeof nextValue === 'undefined' || (nextNode[key] = nextValue);
  }

  'hasPart' in nextNode || (childIds.size && (nextNode['hasPart'] = toNodeSet(undefined, childIds)));
  'isPartOf' in nextNode || (parentIds.size && (nextNode['isPartOf'] = toNodeSet(undefined, parentIds)));

  return nextNode;
}

/** Folds changes in the overlay into `partOfIds`, O(number of changes). */
function rotatePartOfIds(draft: Draft): FrozenSet<Identifier> {
  if (draft.partOfOverlay) {
    draft.partOfIds = draft.partOfOverlay.commit();
    draft.partOfOverlay = undefined;
  }

  return draft.partOfIds;
}

/**
 * Creates a draft of a node in the graph, or of a draft node created by `createNode()`. A draft node is owned by the
 * draft and must not be used by the caller anymore.
 */
function createDraft(node: DraftNode | FrozenInternalNode): Draft {
  const partOfIds = getIsPartOfIds(node);

  return {
    dateCreatedTime: getDateCreatedTime(node),
    id: node['@id'],
    node,
    partOfIds: isFrozenSet(partOfIds)
      ? (partOfIds satisfies ReadonlySet<unknown> as FrozenSet<Identifier>)
      : new FrozenSet(partOfIds),
    partOfOverlay: undefined
  };
}

/** Gets IDs of parents in `isPartOf` with changes applied. */
function getDraftPartOfIds(draft: Draft): ReadonlySet<Identifier> {
  return draft.partOfOverlay ?? draft.partOfIds;
}

/**
 * Gets IDs of all nodes referenced by the node with changes applied, excluding `hasPart`.
 */
function getDraftReferenceIds(draft: Draft): Set<Identifier> {
  const referenceIds = new Set<Identifier>(getDraftPartOfIds(draft));

  for (const [key, value] of Object.entries(draft.node)) {
    if (isReferenceProperty(key, value)) {
      for (const item of value) {
        is(nodeReferenceSchema, item) && referenceIds.add(item['@id']);
      }
    }
  }

  return referenceIds;
}

/**
 * Adds or removes a parent from `isPartOf`.
 *
 * @returns `true` if `isPartOf` is changed, otherwise, `false`.
 */
function setDraftPartOf(draft: Draft, parentId: Identifier, included: boolean): boolean {
  if (getDraftPartOfIds(draft).has(parentId) === included) {
    return false;
  }

  draft.partOfOverlay ??= draft.partOfIds.mutate();
  included ? draft.partOfOverlay.add(parentId) : draft.partOfOverlay.delete(parentId);

  return true;
}

/**
 * Removes all references to the specified node ID, including `isPartOf`.
 *
 * If any property value is changed, the node is rebuilt once, O(number of properties).
 *
 * @returns `true` if any references are removed, otherwise, `false`.
 */
function removeDraftReferencesTo(draft: Draft, id: Identifier): boolean {
  let changed = false;

  const nextEntries = Object.entries(draft.node).flatMap(([key, value]): [string, unknown][] => {
    if (isPartProperty(key) || !isReferenceProperty(key, value)) {
      return [[key, value]];
    }

    const nextValues = value.filter(value => !isReferenceTo(id, value));

    if (nextValues.length === value.length) {
      return [[key, value]];
    }

    changed = true;

    // OPINION: Empty property value is same as if the property is removed.
    // Items are already frozen, only the array is new.
    return nextValues.length ? [[key, Object.freeze(nextValues)]] : [];
  });

  changed && (draft.node = Object.fromEntries(nextEntries) satisfies object as DraftNode);

  return setDraftPartOf(draft, id, false) || changed;
}

/**
 * Reads the draft for an updater (dirty read), with current `hasPart` and `isPartOf`.
 *
 * Returns a new unfrozen plain object, O(number of properties), regardless of the number of parts. The draft does not
 * own it, the caller must freeze it after the updater returns or throws, so userland can only modify it inside the
 * updater.
 *
 * @param childIds IDs of children, `hasPart` is generated from it.
 */
function readDraft(draft: Draft, childIds: FrozenSet<Identifier>): DraftNode {
  return buildNode(draft.node, rotatePartOfIds(draft), childIds) satisfies object as DraftNode;
}

/**
 * Freezes the node with changes applied, `hasPart` generated from `childIds`, and hidden state attached.
 *
 * This is O(number of properties), regardless of the number of parts. If the draft owns the node and no property needs
 * to be removed, it is frozen in place without copying. The draft can be modified after commit, the next write will
 * copy the committed node.
 *
 * @param childIds IDs of children, `hasPart` is generated from it. `hasPart` of the node is ignored.
 * @param sortedChildIds IDs of children sorted by `dateCreated`, see `getSortedChildIds()`.
 */
function commitDraft(
  draft: Draft,
  childIds: FrozenSet<Identifier>,
  sortedChildIds: FrozenSkipList<Identifier> | undefined
): FrozenInternalNode {
  const { node } = draft;
  const partOfIds = rotatePartOfIds(draft);

  let nextNode: NodeObject;

  // Avoids `delete`, which is slower than rebuilding the object, see `npm run benchmark:node`.
  if (Object.isFrozen(node) || (!childIds.size && 'hasPart' in node) || (!partOfIds.size && 'isPartOf' in node)) {
    nextNode = buildNode(node, partOfIds, childIds);
  } else {
    nextNode = node satisfies object as NodeObject;

    childIds.size && (nextNode['hasPart'] = toNodeSet(nextNode['hasPart'], childIds));
    partOfIds.size && (nextNode['isPartOf'] = toNodeSet(nextNode['isPartOf'], partOfIds));
  }

  // The node is frozen, the draft no longer owns it.
  return (draft.node = Object.freeze(
    stampHiddenNodeState(nextNode, { dateCreatedTime: draft.dateCreatedTime, sortedChildIds })
  ) satisfies object as FrozenInternalNode);
}

export {
  commitDraft,
  createDraft,
  getDraftPartOfIds,
  getDraftReferenceIds,
  readDraft,
  removeDraftReferencesTo,
  setDraftPartOf,
  type Draft
};
