import createReadonlySet, { isReadonlySet } from '../structure/createReadonlySet.ts';

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

/** Deeply freezes the item, reuses the original item (from `getDataPropertyValue()`) if possible. */
function deepFreezeItem(originalItem: unknown, item: unknown): unknown {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return deepFreeze(originalItem === NOT_DATA_PROPERTY ? undefined : originalItem, item);
}

/**
 * Freezes every item of the array in a single pass, and checks if the original value can be reused at the same time.
 */
function deepFreezeArray(originalObject: object | undefined, value: readonly unknown[]): readonly unknown[] {
  const frozenValue: unknown[] = [];
  const numReusableKeys = Array.isArray(originalObject) ? getNumReusableKeys(originalObject) : undefined;
  let reusable = numReusableKeys === value.length;

  for (let index = 0; index < value.length; index++) {
    const originalItem = getDataPropertyValue(originalObject, `${index}`);
    const item = deepFreezeItem(originalItem, value[+index]);

    reusable &&= item === originalItem;
    frozenValue.push(item);
  }

  return reusable && Array.isArray(originalObject) ? originalObject : Object.freeze(frozenValue);
}

/**
 * Freezes every property of the object in a single pass, and checks if the original value can be reused at the same
 * time.
 */
function deepFreezeObject(originalObject: object | undefined, value: object): object {
  const frozenValue: Record<string, unknown> = {};
  const keys = Object.keys(value);
  let reusable =
    !!originalObject && !Array.isArray(originalObject) && getNumReusableKeys(originalObject) === keys.length;

  for (const key of keys) {
    const originalItem = getDataPropertyValue(originalObject, key);
    const item = deepFreezeItem(originalItem, Reflect.get(value, key));

    reusable &&= item === originalItem;

    // "__proto__" must be defined as an own property, assigning it would change the prototype instead.
    key === '__proto__'
      ? Object.defineProperty(frozenValue, key, { configurable: true, enumerable: true, value: item, writable: true })
      : // eslint-disable-next-line security/detect-object-injection
        (frozenValue[key] = item);
  }

  return reusable && originalObject ? originalObject : Object.freeze(frozenValue);
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

  return (Array.isArray(value)
    ? deepFreezeArray(originalObject, value)
    : deepFreezeObject(originalObject, value)) satisfies unknown as T;
}

export default deepFreeze;
