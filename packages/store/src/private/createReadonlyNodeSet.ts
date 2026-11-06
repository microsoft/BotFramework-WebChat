import type { Identifier } from '../node/NodeIdentifier.ts';
import type { NodeReference } from '../node/NodeReference.ts';
import createReadonlySet, { isReadonlySet } from './createReadonlySet.ts';
import SetView from './SetView.ts';

/**
 * A read-only `Set` of node references, e.g. `hasPart` and `isPartOf`.
 *
 * Internally, IDs are stored instead of node references. Use `getNodeSetIds()` to get the IDs without copying.
 */
type ReadonlyNodeSet = ReadonlySet<NodeReference>;

function throwReadonly(): never {
  throw new TypeError('Cannot modify a readonly Set');
}

function toNodeReference(id: Identifier): NodeReference {
  return Object.freeze({ '@id': id });
}

/**
 * An immutable `Set` of node references backed by a read-only `Set` of IDs.
 *
 * - Values are frozen node references created on iteration, they are not the same object across iterations
 * - Node references are compared by ID, i.e. `has({ '@id': id })` is `true` if the ID is in the set
 *
 * Similar to `createReadonlySet()`, it does not extend `Set` and its prototype is chained to `Set.prototype`.
 */
class ReadonlyNodeSetImpl extends SetView<NodeReference> implements ReadonlyNodeSet {
  constructor(ids: ReadonlySet<Identifier>) {
    super();

    this.#ids = ids;

    Object.freeze(this);
  }

  readonly #ids: ReadonlySet<Identifier>;

  static getIds(value: unknown): ReadonlySet<Identifier> | undefined {
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

Object.defineProperties(ReadonlyNodeSetImpl.prototype, {
  // Mutating methods on `Set.prototype` would throw "incompatible receiver", override them with a clearer error.
  add: { value: throwReadonly },
  clear: { value: throwReadonly },
  delete: { value: throwReadonly }
});

// Some libraries compare `constructor` for equality, e.g. `expect().toEqual()`.
Object.defineProperty(ReadonlyNodeSetImpl.prototype, 'constructor', { value: Set });
Object.freeze(ReadonlyNodeSetImpl.prototype);
Object.freeze(ReadonlyNodeSetImpl);

/**
 * Gets IDs of node references in a `ReadonlyNodeSet` in O(1) without copying.
 *
 * @returns A read-only `Set` of IDs, or `undefined` if the value is not created by `createReadonlyNodeSet()`.
 */
function getNodeSetIds(value: unknown): ReadonlySet<Identifier> | undefined {
  return ReadonlyNodeSetImpl.getIds(value);
}

/**
 * Creates an immutable `Set` of node references from IDs.
 *
 * If `ids` is created by `createReadonlySet()`, it is used as-is without copying, otherwise, it is copied.
 */
function createReadonlyNodeSet(ids: Iterable<Identifier>): ReadonlyNodeSet {
  return new ReadonlyNodeSetImpl(
    isReadonlySet(ids) ? (ids satisfies ReadonlySet<unknown> as ReadonlySet<Identifier>) : createReadonlySet(ids)
  );
}

export default createReadonlyNodeSet;
export { getNodeSetIds, type ReadonlyNodeSet };
