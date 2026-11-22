import type { NodeIdentifier } from '../node/NodeIdentifier.ts';
import type { NodeReference } from '../node/NodeReference.ts';
import FrozenSet, { isFrozenSet } from './FrozenSet.ts';
import SetView from './SetView.ts';

function throwReadonly(): never {
  throw new TypeError('Cannot modify a readonly Set');
}

function toNodeReference(id: NodeIdentifier): NodeReference {
  return Object.freeze({ '@id': id });
}

/**
 * Node references are compared by ID.
 *
 * Keys are prefixed so a node reference never collides with a string of the same ID, e.g. `{ '@id': '_:b' }` and
 * `'_:b'` are different values.
 */
function getEqualityKey(value: unknown): unknown {
  if (value && typeof value === 'object' && '@id' in value && typeof value['@id'] === 'string') {
    return `@id:${value['@id']}`;
  }

  return typeof value === 'string' ? `string:${value}` : value;
}

/**
 * An immutable `Set` of node references, e.g. `hasPart` and `isPartOf`.
 *
 * Internally, IDs are stored instead of node references. Use `getNodeSetIds()` to get the IDs without copying.
 *
 * - Values are frozen node references created on iteration, they are not the same object across iterations
 * - Node references are compared by ID, i.e. `has({ '@id': id })` is `true` if the ID is in the set
 * - If `ids` is a `FrozenSet`, it is used as-is without copying, otherwise, it is copied
 *
 * Similar to `FrozenSet`, it does not extend `Set` and its prototype is chained to `Set.prototype`.
 */
class FrozenNodeSet extends SetView<NodeReference> {
  constructor(ids: Iterable<NodeIdentifier>) {
    super(getEqualityKey);

    this.#ids = isFrozenSet(ids)
      ? (ids satisfies ReadonlySet<unknown> as ReadonlySet<NodeIdentifier>)
      : new FrozenSet(ids);

    Object.freeze(this);
  }

  readonly #ids: ReadonlySet<NodeIdentifier>;

  static getIds(value: unknown): ReadonlySet<NodeIdentifier> | undefined {
    return value && typeof value === 'object' && #ids in value ? value.#ids : undefined;
  }

  get size(): number {
    return this.#ids.size;
  }

  has(value: NodeReference): boolean {
    return !!value && typeof value === 'object' && this.#ids.has(value['@id']);
  }

  *keys(): SetIterator<NodeReference> {
    for (const id of this.#ids) {
      yield toNodeReference(id);
    }
  }
}

Object.defineProperties(FrozenNodeSet.prototype, {
  // Mutating methods on `Set.prototype` would throw "incompatible receiver", override them with a clearer error.
  add: { value: throwReadonly },
  clear: { value: throwReadonly },
  delete: { value: throwReadonly }
});

// Some libraries compare `constructor` for equality, e.g. `expect().toEqual()`.
Object.defineProperty(FrozenNodeSet.prototype, 'constructor', { value: Set });
Object.freeze(FrozenNodeSet.prototype);
Object.freeze(FrozenNodeSet);

/**
 * Gets IDs of node references in a `FrozenNodeSet` in O(1) without copying.
 *
 * @returns A read-only `Set` of IDs, or `undefined` if the value is not created by `FrozenNodeSet`.
 */
function getNodeSetIds(value: unknown): ReadonlySet<NodeIdentifier> | undefined {
  return FrozenNodeSet.getIds(value);
}

export default FrozenNodeSet;
export { getNodeSetIds };
