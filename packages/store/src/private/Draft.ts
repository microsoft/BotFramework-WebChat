import { is } from 'valibot';
import type { Identifier } from '../node/NodeIdentifier.ts';
import { nodeReferenceSchema, type NodeReference } from '../node/NodeReference.ts';
import FrozenNodeSet, { getNodeSetIds } from '../structure/FrozenNodeSet.ts';
import FrozenSet, { isFrozenSet, type ReadWriteSet } from '../structure/FrozenSet.ts';
import type FrozenSkipList from '../structure/FrozenSkipList.ts';
import type { DraftNode } from './DraftNode.ts';
import type { FrozenNode } from './FrozenNode.ts';
import { getIsPartOfIds } from './getPartIds.ts';
import { getDateCreatedTime, stampHiddenNodeState } from './hiddenNodeState.ts';

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

/**
 * A node being modified in a transaction, i.e. changes made by the store on top of a node (e.g. mirroring `isPartOf`,
 * removing references to a deleted node).
 *
 * - `hasPart` and `isPartOf` of the node are ignored, `hasPart` is generated from the child IDs passed in, and
 *   `isPartOf` is kept separately
 * - If the node is not frozen (i.e. created by `createDraftNode()`), the draft owns it and could modify it in place
 * - If the node is frozen (i.e. in the graph or handed to userland), it is never modified, it is copied on write
 *
 * The draft is mutable and must never be exposed to userland.
 */
class Draft {
  /**
   * Creates a draft of a node in the graph, or of a draft node created by `createDraftNode()`. A draft node is owned by
   * the draft and must not be used by the caller anymore.
   */
  constructor(node: DraftNode | FrozenNode) {
    const partOfIds = getIsPartOfIds(node);

    this.dateCreatedTime = getDateCreatedTime(node);
    this.id = node['@id'];
    this.#node = node;
    this.#partOfIds = isFrozenSet(partOfIds)
      ? (partOfIds satisfies ReadonlySet<unknown> as FrozenSet<Identifier>)
      : new FrozenSet(partOfIds);
  }

  readonly dateCreatedTime: number;
  readonly id: Identifier;

  #node: DraftNode | FrozenNode;
  /** `isPartOf` before changes in `#partOfOverlay`. */
  #partOfIds: FrozenSet<Identifier>;
  /** Changes to `isPartOf` since `#partOfIds` is taken, `undefined` if unchanged. */
  #partOfOverlay: ReadWriteSet<Identifier> | undefined;

  /** IDs of parents in `isPartOf` with changes applied. */
  get partOfIds(): ReadonlySet<Identifier> {
    return this.#partOfOverlay ?? this.#partOfIds;
  }

  /** Folds changes in the overlay into `#partOfIds`, O(number of changes). */
  #rotatePartOfIds(): FrozenSet<Identifier> {
    if (this.#partOfOverlay) {
      this.#partOfIds = this.#partOfOverlay.commit();
      this.#partOfOverlay = undefined;
    }

    return this.#partOfIds;
  }

  /**
   * Freezes the node with changes applied, `hasPart` generated from `childIds`, and hidden state attached.
   *
   * This is O(number of properties), regardless of the number of parts. If the draft owns the node and no property
   * needs to be removed, it is frozen in place without copying. The draft can be modified after commit, the next write
   * will copy the committed node.
   *
   * @param childIds IDs of children, `hasPart` is generated from it. `hasPart` of the node is ignored.
   * @param sortedChildIds IDs of children sorted by `dateCreated`, see `getSortedChildIds()`.
   */
  commit(childIds: FrozenSet<Identifier>, sortedChildIds: FrozenSkipList<Identifier> | undefined): FrozenNode {
    const node = this.#node;
    const partOfIds = this.#rotatePartOfIds();

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
    return (this.#node = Object.freeze(
      stampHiddenNodeState(nextNode, { dateCreatedTime: this.dateCreatedTime, sortedChildIds })
    ) satisfies object as FrozenNode);
  }

  /**
   * Gets IDs of all nodes referenced by the node with changes applied, excluding `hasPart`.
   */
  getReferenceIds(): Set<Identifier> {
    const referenceIds = new Set<Identifier>(this.partOfIds);

    for (const [key, value] of Object.entries(this.#node)) {
      if (isReferenceProperty(key, value)) {
        for (const item of value) {
          is(nodeReferenceSchema, item) && referenceIds.add(item['@id']);
        }
      }
    }

    return referenceIds;
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
  read(childIds: FrozenSet<Identifier>): DraftNode {
    return buildNode(this.#node, this.#rotatePartOfIds(), childIds) satisfies object as DraftNode;
  }

  /**
   * Removes all references to the specified node ID, including `isPartOf`.
   *
   * If any property value is changed, the node is rebuilt once, O(number of properties).
   *
   * @returns `true` if any references are removed, otherwise, `false`.
   */
  removeReferencesTo(id: Identifier): boolean {
    let changed = false;

    const nextEntries = Object.entries(this.#node).flatMap(([key, value]): [string, unknown][] => {
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

    changed && (this.#node = Object.fromEntries(nextEntries) satisfies object as DraftNode);

    return this.setPartOf(id, false) || changed;
  }

  /**
   * Adds or removes a parent from `isPartOf`.
   *
   * @returns `true` if `isPartOf` is changed, otherwise, `false`.
   */
  setPartOf(parentId: Identifier, included: boolean): boolean {
    if (this.partOfIds.has(parentId) === included) {
      return false;
    }

    this.#partOfOverlay ??= this.#partOfIds.mutate();
    included ? this.#partOfOverlay.add(parentId) : this.#partOfOverlay.delete(parentId);

    return true;
  }
}

export default Draft;
