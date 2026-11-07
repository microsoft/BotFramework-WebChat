import ReadonlySet, { isReadonlySet } from '../structure/ReadonlySet.ts';

/**
 * Keys which could be used for prototype pollution, they are skipped when copying an object.
 *
 * Validated value could contain them as own properties, e.g. `JSON.parse('{"__proto__":{}}')`.
 */
const DANGEROUS_KEYS: globalThis.ReadonlySet<string> = Object.freeze(
  new Set(['__proto__', 'constructor', 'prototype'])
);

/** Checks if the key could be used for prototype pollution, e.g. `__proto__`, `constructor`, and `prototype`. */
function isDangerousKey(key: string): boolean {
  return DANGEROUS_KEYS.has(key);
}

/** Marks a `Set` which is being frozen, used to detect a recursive `Set`, which cannot be frozen. */
const IN_PROGRESS: unique symbol = Symbol('in progress');

/**
 * Ancestors being frozen within a single `deepFreeze()` call, used to point recursive references to the frozen version.
 *
 * Arrays and objects are pushed before their properties are frozen, and popped after. The frozen version is frozen
 * after all its properties are set. As the depth is usually small, arrays with linear search is faster than `Map`.
 */
type Memo = {
  /** Frozen versions of the ancestors, or `IN_PROGRESS` for `Set`, which cannot be referenced before it is created. */
  readonly frozenValues: unknown[];
  readonly values: object[];
};

function pushAncestor(memo: Memo, value: object, frozenValue: unknown): void {
  memo.frozenValues.push(frozenValue);
  memo.values.push(value);
}

function popAncestor(memo: Memo): void {
  memo.frozenValues.pop();
  memo.values.pop();
}

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
function deepFreezeItem(originalItem: unknown, item: unknown, memo: Memo): unknown {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return deepFreezeWithMemo(originalItem === NOT_DATA_PROPERTY ? undefined : originalItem, item, memo);
}

/**
 * Freezes every item of the array in a single pass, and checks if the original value can be reused at the same time.
 */
function deepFreezeArray(
  originalObject: object | undefined,
  value: readonly unknown[],
  memo: Memo
): readonly unknown[] {
  const frozenValue: unknown[] = [];
  const numReusableKeys = Array.isArray(originalObject) ? getNumReusableKeys(originalObject) : undefined;
  let reusable = numReusableKeys === value.length;

  pushAncestor(memo, value, frozenValue);

  for (let index = 0; index < value.length; index++) {
    const originalItem = getDataPropertyValue(originalObject, `${index}`);
    const item = deepFreezeItem(originalItem, value[+index], memo);

    reusable &&= item === originalItem;
    frozenValue.push(item);
  }

  popAncestor(memo);

  // A recursive array is never reusable, as the recursive reference points to the copy, not the original.
  return reusable && Array.isArray(originalObject) ? originalObject : Object.freeze(frozenValue);
}

/**
 * Freezes every property of the object in a single pass, and checks if the original value can be reused at the same
 * time.
 *
 * The copy is always a plain object (i.e. prototype is `Object.prototype`). Dangerous keys (e.g. `__proto__`,
 * `constructor`, and `prototype`) are skipped, and the original value is not reused if it has any of them.
 */
function deepFreezeObject(originalObject: object | undefined, value: object, memo: Memo): object {
  const frozenValue: Record<string, unknown> = {};
  const keys = Object.keys(value);
  let reusable =
    !!originalObject && !Array.isArray(originalObject) && getNumReusableKeys(originalObject) === keys.length;

  pushAncestor(memo, value, frozenValue);

  for (const key of keys) {
    if (isDangerousKey(key)) {
      reusable = false;

      continue;
    }

    const originalItem = getDataPropertyValue(originalObject, key);
    const item = deepFreezeItem(originalItem, Reflect.get(value, key), memo);

    reusable &&= item === originalItem;

    // eslint-disable-next-line security/detect-object-injection
    frozenValue[key] = item;
  }

  popAncestor(memo);

  // A recursive object is never reusable, as the recursive reference points to the copy, not the original.
  return reusable && originalObject ? originalObject : Object.freeze(frozenValue);
}

function deepFreezeWithMemo(originalValue: unknown, value: unknown, memo: Memo): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }

  const ancestorIndex = memo.values.indexOf(value);

  if (~ancestorIndex) {
    const frozenValue = memo.frozenValues[+ancestorIndex];

    if (frozenValue === IN_PROGRESS) {
      throw new TypeError('Recursive Set cannot be frozen');
    }

    return frozenValue;
  } else if (value instanceof Set || isReadonlySet(value)) {
    pushAncestor(memo, value, IN_PROGRESS);

    const originalItems = isReadonlySet(originalValue) ? Array.from(originalValue) : [];
    const items = Array.from(value, (item, index) => deepFreezeWithMemo(originalItems[+index], item, memo));
    const frozenValue =
      isReadonlySet(originalValue) &&
      originalItems.length === items.length &&
      items.every((item, index) => item === originalItems[+index])
        ? originalValue
        : new ReadonlySet(items);

    popAncestor(memo);

    return frozenValue;
  }

  const originalObject = originalValue && typeof originalValue === 'object' ? originalValue : undefined;

  return Array.isArray(value)
    ? deepFreezeArray(originalObject, value, memo)
    : deepFreezeObject(originalObject, value, memo);
}

/**
 * Returns a deeply immutable version of the validated value. Arrays and objects are frozen, and `Set` is replaced by a
 * readonly `Set`.
 *
 * If the original value (before validation) is already deeply immutable and the same as the validated value, it is
 * returned as-is without copying, e.g. unchanged properties of a node from the store. Otherwise, it is copied, and
 * immutable parts of it are reused.
 *
 * Recursive references point to the frozen version of the referenced ancestor. A recursive value is always copied, and
 * its recursive references point to the copy. A recursive `Set` cannot be frozen and will
 * throw, as a read-only `Set` cannot be created before its items.
 *
 * Note: `Object.freeze()` does not prevent `Set.prototype.add()` and `Set.prototype.delete()` from modifying the set,
 * only read-only `Set` created by `new ReadonlySet()` is reused.
 *
 * @param originalValue Value before validation. Validation could copy or transform the value.
 * @param value Value after validation.
 */
function deepFreeze<T>(originalValue: unknown, value: T): T {
  // Primitives do not need a memo.
  return (!value || typeof value !== 'object'
    ? value
    : deepFreezeWithMemo(originalValue, value, { frozenValues: [], values: [] })) satisfies unknown as T;
}

export default deepFreeze;
export { isDangerousKey };
