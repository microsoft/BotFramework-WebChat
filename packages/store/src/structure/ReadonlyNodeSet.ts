import type { Identifier } from '../node/NodeIdentifier.ts';
import type { NodeReference } from '../node/NodeReference.ts';
import ReadonlySet, { isReadonlySet } from './ReadonlySet.ts';
import SetView from './SetView.ts';

function throwReadonly(): never {
  throw new TypeError('Cannot modify a readonly Set');
}

function toNodeReference(id: Identifier): NodeReference {
  return Object.freeze({ '@id': id });
}

/**
 * An immutable `Set` of node references, e.g. `hasPart` and `isPartOf`.
 *
 * Internally, IDs are stored instead of node references. Use `getNodeSetIds()` to get the IDs without copying.
 *
 * - Values are frozen node references created on iteration, they are not the same object across iterations
 * - Node references are compared by ID, i.e. `has({ '@id': id })` is `true` if the ID is in the set
 * - If `ids` is a `ReadonlySet`, it is used as-is without copying, otherwise, it is copied
 *
 * Similar to `ReadonlySet`, it does not extend `Set` and its prototype is chained to `Set.prototype`.
 */
class ReadonlyNodeSet extends SetView<NodeReference> {
  constructor(ids: Iterable<Identifier>) {
    super();

    this.#ids = isReadonlySet(ids)
      ? (ids satisfies globalThis.ReadonlySet<unknown> as globalThis.ReadonlySet<Identifier>)
      : new ReadonlySet(ids);

    Object.freeze(this);
  }

  readonly #ids: globalThis.ReadonlySet<Identifier>;

  static getIds(value: unknown): globalThis.ReadonlySet<Identifier> | undefined {
    return value && typeof value === 'object' && #ids in value ? value.#ids : undefined;
  }

  get size(): number {
    return this.#ids.size;
  }

  has(value: NodeReference): boolean {
    return !!value && typeof value === 'object' && this.#ids.has(value['@id']);
  }

  keys(): SetIterator<NodeReference> {
    return this.#ids
      .values()
      .map(toNodeReference) satisfies IteratorObject<NodeReference> as SetIterator<NodeReference>;
  }
}

Object.defineProperties(ReadonlyNodeSet.prototype, {
  // Mutating methods on `Set.prototype` would throw "incompatible receiver", override them with a clearer error.
  add: { value: throwReadonly },
  clear: { value: throwReadonly },
  delete: { value: throwReadonly }
});

// Some libraries compare `constructor` for equality, e.g. `expect().toEqual()`.
Object.defineProperty(ReadonlyNodeSet.prototype, 'constructor', { value: Set });
Object.freeze(ReadonlyNodeSet.prototype);
Object.freeze(ReadonlyNodeSet);

/**
 * Gets IDs of node references in a `ReadonlyNodeSet` in O(1) without copying.
 *
 * @returns A read-only `Set` of IDs, or `undefined` if the value is not created by `ReadonlyNodeSet`.
 */
function getNodeSetIds(value: unknown): globalThis.ReadonlySet<Identifier> | undefined {
  return ReadonlyNodeSet.getIds(value);
}

export default ReadonlyNodeSet;
export { getNodeSetIds };
