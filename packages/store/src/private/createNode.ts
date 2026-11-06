import { parse } from 'valibot';
import { nodeSchema } from '../node/Node.ts';
import type { NodeReference } from '../node/NodeReference.ts';
import createReadonlySet, { isReadonlySet } from '../structure/createReadonlySet.ts';
import { attachDateCreatedTime, parseDateCreatedTime } from './dateCreatedTime.ts';
import type { InternalNode } from './InternalNode.ts';
import createReadonlyNodeSet, { getNodeSetIds, type ReadonlyNodeSet } from '../structure/createReadonlyNodeSet.ts';

/** Returned by `getDataPropertyValue()` if it is not an own, enumerable data property. */
const NOT_DATA_PROPERTY: unique symbol = Symbol('not data property');

/**
 * Gets the value of an own, enumerable data property. Getters are not called, as they could have side effects or
 * return a different value on every read.
 */
function getDataPropertyValue(object: unknown, key: string): unknown {
  const descriptor = object && typeof object === 'object' ? Reflect.getOwnPropertyDescriptor(object, key) : undefined;

  return descriptor && 'value' in descriptor && descriptor.enumerable ? descriptor.value : NOT_DATA_PROPERTY;
}

/**
 * Gets the number of own keys of a frozen plain object or array, if it could be reused as-is, otherwise, `undefined`.
 *
 * Caveats which `Object.isFrozen()` does not check, they cannot be reused and must be copied:
 *
 * - Prototype other than `Object.prototype`, `null`, or `Array.prototype`, e.g. `Object.create(mutablePrototype)`
 * - Symbol keys or non-enumerable properties, they will not be copied
 * - Getters, they could return a different value on every read (checked by `getDataPropertyValue()`)
 * - Arrays with holes or extra properties (checked by number of keys)
 */
function getNumReusableKeys(value: object): number | undefined {
  if (!Object.isFrozen(value)) {
    return undefined;
  }

  const keys = Reflect.ownKeys(value);
  const prototype = Object.getPrototypeOf(value);

  if (!keys.every(key => typeof key === 'string')) {
    return undefined;
  } else if (Array.isArray(value)) {
    // Excludes "length".
    return prototype === Array.prototype ? keys.length - 1 : undefined;
  }

  return prototype === Object.prototype || prototype === null ? keys.length : undefined;
}

/**
 * Returns a deeply immutable version of the validated value. Arrays and objects are frozen, and `Set` is replaced by a
 * readonly `Set`.
 *
 * If the original value (before validation) is already deeply immutable and the same as the validated value, it is
 * returned as-is without copying, e.g. unchanged properties of a node from the store. Otherwise, it is copied, and
 * immutable parts of it are reused.
 *
 * Note: `Object.freeze()` does not prevent `Set.prototype.add()` and `Set.prototype.delete()` from modifying the set,
 * only read-only `Set` created by `createReadonlySet()` is reused.
 *
 * @param originalValue Value before validation. Validation could copy or transform the value.
 * @param value Value after validation.
 */
function deepFreeze<T>(originalValue: unknown, value: T): T {
  if (!value || typeof value !== 'object') {
    return value;
  } else if (value instanceof Set || isReadonlySet(value)) {
    const originalItems = isReadonlySet(originalValue) ? Array.from(originalValue) : [];
    const items = Array.from(value, (item, index) => deepFreeze(originalItems[+index], item));

    return (isReadonlySet(originalValue) &&
    originalItems.length === items.length &&
    items.every((item, index) => item === originalItems[+index])
      ? originalValue
      : createReadonlySet(items)) satisfies unknown as T;
  }

  const originalObject = originalValue && typeof originalValue === 'object' ? originalValue : undefined;
  const entries = (Array.isArray(value) ? value.entries() : Object.entries(value).values())
    .map(([key, item]) => {
      const originalItem = getDataPropertyValue(originalObject, `${key}`);

      return [`${key}`, deepFreeze(originalItem === NOT_DATA_PROPERTY ? undefined : originalItem, item)] as const;
    })
    .toArray();

  // Reuses the original value if it is deeply immutable and every property is the same as the validated value.
  if (
    originalObject &&
    Array.isArray(originalObject) === Array.isArray(value) &&
    getNumReusableKeys(originalObject) === entries.length &&
    entries.every(([key, item]) => item === getDataPropertyValue(originalObject, key))
  ) {
    return originalObject satisfies object as T;
  }

  return Object.freeze(
    Array.isArray(value) ? entries.map(([, item]) => item) : Object.fromEntries(entries)
  ) satisfies object as T;
}

/**
 * Returns a `ReadonlyNodeSet` of the node references.
 *
 * - If the original value is a `ReadonlyNodeSet`, it is immutable and returned as-is, i.e. unchanged parts are reused
 * - Otherwise, IDs are copied via an iterator without creating an intermediate array
 *
 * @param originalValue Value before validation. It is validated, but validation always returns a new `Set`.
 * @param value Value after validation.
 */
function toReadonlyNodeSet(originalValue: unknown, value: ReadonlySet<NodeReference>): ReadonlyNodeSet {
  return getNodeSetIds(originalValue)
    ? (originalValue satisfies unknown as ReadonlyNodeSet)
    : createReadonlyNodeSet(value.values().map(({ '@id': id }) => id));
}

/**
 * Validates the value and creates an immutable node for storing in the graph.
 *
 * - The node is validated against the node schema
 * - The node is deeply frozen, values which are already deeply immutable are reused as-is, see `deepFreeze()`
 * - `hasPart` and `isPartOf` are stored as `ReadonlyNodeSet`, so `getPartIds()` can get the IDs in O(1)
 * - `dateCreated` is parsed once and cached as a hidden property for sorting, see `getDateCreatedTime()`
 *
 * All nodes stored in the graph must be created by this function, the returned node is branded as `InternalNode`.
 */
function createNode(value: unknown): InternalNode {
  const safeNode = parse(nodeSchema, value);

  return Object.freeze(
    attachDateCreatedTime(
      Object.fromEntries(
        Object.entries(safeNode).map(([key, safeValue]) => [
          key,
          (key === 'hasPart' || key === 'isPartOf') && safeValue instanceof Set
            ? // `value` is an object as it passed validation.
              toReadonlyNodeSet(Reflect.get(value as object, key), safeValue)
            : deepFreeze(Reflect.get(value as object, key), safeValue)
        ])
      ),
      parseDateCreatedTime(safeNode.dateCreated)
    )
  ) satisfies object as InternalNode;
}

export default createNode;
