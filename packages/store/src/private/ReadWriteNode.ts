import { is } from 'valibot';
import type { Node } from '../node/Node.ts';
import type { Identifier } from '../node/NodeIdentifier.ts';
import { nodeReferenceSchema, type NodeReference } from '../node/NodeReference.ts';
import FrozenNodeSet from '../structure/FrozenNodeSet.ts';
import FrozenSet, { type ReadWriteSet } from '../structure/FrozenSet.ts';
import type FrozenSkipList from '../structure/FrozenSkipList.ts';
import { attachDateCreatedTime, getDateCreatedTime } from './dateCreatedTime.ts';
import freezeNode from './freezeNode.ts';
import getPartIds from './getPartIds.ts';
import type { InternalNode } from './InternalNode.ts';
import type { UnfrozenNode } from './UnfrozenNode.ts';

type WritableNode = {
  [key: string]: unknown;
  isPartOf?: ReadonlySet<NodeReference> | undefined;
};

function isReferenceTo(id: Identifier, value: unknown): boolean {
  return is(nodeReferenceSchema, value) && value['@id'] === id;
}

/**
 * Whether the property could contain node references other than `hasPart` and `isPartOf`, i.e. property values.
 */
function isReferenceProperty(key: string, value: unknown): value is readonly unknown[] {
  return key !== '@context' && key !== '@id' && key !== '@type' && Array.isArray(value);
}

/**
 * A writable draft on top of a node, similar to `mutate()` of `FrozenMap`.
 *
 * Changes made by the store (e.g. mirroring `isPartOf`, removing references to a deleted node) are made on the draft,
 * then `commit()` freezes it as a single node via `freezeNode()`. The node is not validated again as changes are made
 * by the store.
 *
 * - If the node is unfrozen (i.e. created by `createNode()`), the draft takes ownership and modifies it in place
 * - If the node is frozen (i.e. in the graph), it is not modified, it is copied on first write or on commit
 * - `hasPart` of the node is ignored, it is generated on `commit()`
 * - `isPartOf` is modified via `FrozenSet.mutate()` without copying
 */
class ReadWriteNode {
  /**
   * @param node A node in the graph, or an unfrozen node created by `createNode()`. Unfrozen node is owned by the draft
   *             and must not be used by the caller anymore.
   */
  constructor(node: InternalNode | UnfrozenNode) {
    this.#dateCreatedTime = getDateCreatedTime(node);
    this.#node = node;
    this.#writableNode = Object.isFrozen(node) ? undefined : node;

    Object.freeze(this);
  }

  readonly #dateCreatedTime: number;
  #node: Node;
  #readWritePartOfIds: ReadWriteSet<Identifier> | undefined;
  #writableNode: WritableNode | undefined;

  get dateCreatedTime(): number {
    return this.#dateCreatedTime;
  }

  get id(): Identifier {
    return this.#node['@id'];
  }

  /** Gets the node for writing, copies the node if it is frozen. `hasPart` is not copied. */
  #write(): WritableNode {
    if (!this.#writableNode) {
      const { hasPart: _, ...node } = this.#node;

      this.#node = this.#writableNode = attachDateCreatedTime(node, this.#dateCreatedTime);
    }

    return this.#writableNode;
  }

  /** Gets properties with changes applied, excluding `hasPart` and `isPartOf`. */
  #getEntries(): [string, unknown][] {
    return Object.entries(this.#node).filter(([key]) => key !== 'hasPart' && key !== 'isPartOf');
  }

  /**
   * Freezes the node with changes applied, `hasPart` generated from `childIds`, and `sortedChildIds` attached.
   *
   * This is O(number of properties), regardless of the number of parts. If the draft owns the node, it is frozen in
   * place without copying. The draft can be modified after commit, the next write will copy the committed node.
   */
  commit(childIds: ReadonlySet<Identifier>, sortedChildIds: FrozenSkipList<Identifier> | undefined): InternalNode {
    const node = this.#write();
    const readWritePartOfIds = this.#readWritePartOfIds;

    if (readWritePartOfIds) {
      const partOfIds = readWritePartOfIds.commit();

      // The overlay cannot be modified after commit, the next modification will create a new overlay.
      this.#readWritePartOfIds = undefined;

      if (partOfIds.size) {
        node.isPartOf = new FrozenNodeSet(partOfIds);
      } else {
        delete node.isPartOf;
      }
    }

    // The node is frozen in place, the draft no longer owns it.
    this.#writableNode = undefined;

    return (this.#node = freezeNode(
      node satisfies WritableNode as UnfrozenNode,
      childIds,
      sortedChildIds
    ) satisfies InternalNode);
  }

  /** Gets IDs of parents in `isPartOf` with changes applied. */
  getPartOfIds(): ReadonlySet<Identifier> {
    return this.#readWritePartOfIds ?? getPartIds(this.#node, 'isPartOf');
  }

  /**
   * Gets IDs of all nodes referenced by the node with changes applied, excluding `hasPart`.
   */
  getReferenceIds(): Set<Identifier> {
    const referenceIds = new Set<Identifier>(this.getPartOfIds());

    for (const [key, value] of this.#getEntries()) {
      if (isReferenceProperty(key, value)) {
        for (const item of value) {
          is(nodeReferenceSchema, item) && referenceIds.add(item['@id']);
        }
      }
    }

    return referenceIds;
  }

  /**
   * Removes all references to the specified node ID, including `isPartOf`.
   *
   * @returns `true` if any references are removed, otherwise, `false`.
   */
  removeReferencesTo(id: Identifier): boolean {
    let changed = this.setPartOf(id, false);

    for (const [key, value] of this.#getEntries()) {
      if (isReferenceProperty(key, value)) {
        const nextValues = value.filter(value => !isReferenceTo(id, value));

        if (nextValues.length !== value.length) {
          changed = true;

          const node = this.#write();

          // OPINION: Empty property value is same as if the property is removed.
          // Items are already frozen, only the array is new.
          if (nextValues.length) {
            // eslint-disable-next-line security/detect-object-injection
            node[key] = Object.freeze(nextValues);
          } else {
            // eslint-disable-next-line security/detect-object-injection
            delete node[key];
          }
        }
      }
    }

    return changed;
  }

  /**
   * Adds or removes a parent from `isPartOf`.
   *
   * @returns `true` if `isPartOf` is changed, otherwise, `false`.
   */
  setPartOf(parentId: Identifier, included: boolean): boolean {
    const partOfIds = this.getPartOfIds();

    if (partOfIds.has(parentId) === included) {
      return false;
    }

    this.#readWritePartOfIds ??= (partOfIds instanceof FrozenSet ? partOfIds : new FrozenSet(partOfIds)).mutate();
    included ? this.#readWritePartOfIds.add(parentId) : this.#readWritePartOfIds.delete(parentId);

    return true;
  }
}

Object.freeze(ReadWriteNode.prototype);
Object.freeze(ReadWriteNode);

export default ReadWriteNode;
