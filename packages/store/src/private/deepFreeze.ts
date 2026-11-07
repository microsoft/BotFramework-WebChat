import createReadonlySet, { isReadonlySet } from '../structure/createReadonlySet.ts';

/**
 * Keys which could be used for prototype pollution, they are skipped when copying an object.
 *
 * Validated value could contain them as own properties, e.g. `JSON.parse('{"__proto__":{}}')`.
 */
const DANGEROUS_KEYS: ReadonlySet<string> = Object.freeze(new Set(['__proto__', 'constructor', 'prototype']));

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
  /** Clones arrays and objects before freezing, otherwise, freezes the original in place if possible. */
  readonly clone: boolean;
  /** Frozen versions of the ancestors, or `IN_PROGRESS` for `Set`, which cannot be referenced before it is created. */
  readonly frozenValues: unknown[];
  /** Whether a recursive reference to the ancestor has been handed out. */
  readonly referenced: boolean[];
  readonly values: object[];
};

function pushAncestor(memo: Memo, value: object, frozenValue: unknown): void {
  memo.frozenValues.push(frozenValue);
  memo.referenced.push(false);
  memo.values.push(value);
}

function popAncestor(memo: Memo): void {
  memo.frozenValues.pop();
  memo.referenced.pop();
  memo.values.pop();
}

/**
 * Replaces the frozen version of the innermost ancestor, when freezing in place is not possible and it is cloned.
 *
 * Throws if a recursive reference to the original has been handed out, as it cannot be pointed to the clone.
 */
function replaceAncestor(memo: Memo, frozenValue: object): void {
  const index = memo.values.length - 1;

  if (memo.referenced[+index]) {
    throw new TypeError('Recursive value cannot be frozen in place as some of its properties cannot be redefined');
  }

  memo.frozenValues[+index] = frozenValue;
}

/**
 * Returns the original array or object if it can be frozen in place, i.e. not cloning, otherwise, `undefined`.
 *
 * It must be extensible (i.e. not frozen, sealed, or prevented extensions) and its prototype must be `Array.prototype`
 * or `Object.prototype`, so it is the same as a clone.
 */
function getInPlaceTarget(memo: Memo, originalObject: object | undefined, isArray: boolean): object | undefined {
  return !memo.clone &&
    originalObject &&
    Array.isArray(originalObject) === isArray &&
    Object.isExtensible(originalObject) &&
    Object.getPrototypeOf(originalObject) === (isArray ? Array.prototype : Object.prototype)
    ? originalObject
    : undefined;
}

/** Sets an own, enumerable, writable, and configurable data property, replaces getters or non-enumerable properties. */
function setDataProperty(target: object, key: string, value: unknown): boolean {
  return Reflect.defineProperty(target, key, { configurable: true, enumerable: true, value, writable: true });
}

/**
 * Deletes own properties of the in-place target which are not in the validated value, e.g. property with value of
 * `undefined`, dangerous keys, symbol keys, and non-enumerable properties.
 *
 * @returns `false` if some properties cannot be deleted.
 */
function deleteExtraProperties(target: object, value: object, numKeys: number): boolean {
  const ownKeys = Reflect.ownKeys(target);

  // Fast path: nothing to delete. Arrays have an extra "length" own property.
  if (ownKeys.length === numKeys + (Array.isArray(target) ? 1 : 0)) {
    return true;
  }

  return ownKeys.every(
    key =>
      (typeof key === 'string' &&
        !isDangerousKey(key) &&
        Object.hasOwn(value, key) &&
        (Object.prototype.propertyIsEnumerable.call(target, key) || (key === 'length' && Array.isArray(target)))) ||
      Reflect.deleteProperty(target, key)
  );
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
 * Clones properties of the in-place target which are frozen, i.e. keys of the validated value which are already set.
 */
function cloneObject(target: object, value: object): Record<string, unknown> {
  const clone: Record<string, unknown> = {};

  for (const key of Object.keys(value)) {
    const item = getDataPropertyValue(target, key);

    // eslint-disable-next-line security/detect-object-injection
    isDangerousKey(key) || item === NOT_DATA_PROPERTY || (clone[key] = item);
  }

  return clone;
}

/**
 * Freezes every item of the array in a single pass, and checks if the original value can be reused at the same time.
 */
function deepFreezeArray(
  originalObject: object | undefined,
  value: readonly unknown[],
  memo: Memo
): readonly unknown[] {
  const inPlaceTarget = getInPlaceTarget(memo, originalObject, true) as unknown[] | undefined;
  const numReusableKeys = Array.isArray(originalObject) ? getNumReusableKeys(originalObject) : undefined;
  let frozenValue: unknown[] = inPlaceTarget ?? [];
  let reusable = numReusableKeys === value.length;

  pushAncestor(memo, value, frozenValue);

  for (let index = 0; index < value.length; index++) {
    const originalItem = getDataPropertyValue(originalObject, `${index}`);
    const item = deepFreezeItem(originalItem, value[+index], memo);

    reusable &&= item === originalItem;

    if (frozenValue !== inPlaceTarget) {
      frozenValue.push(item);
    } else if (item !== originalItem && !setDataProperty(frozenValue, `${index}`, item)) {
      // Cannot be frozen in place, clone frozen items so far.
      frozenValue = [...frozenValue.slice(0, index), item];
      replaceAncestor(memo, frozenValue);
    }
  }

  if (frozenValue === inPlaceTarget && !deleteExtraProperties(frozenValue, value, value.length)) {
    frozenValue = frozenValue.slice(0, value.length);
    replaceAncestor(memo, frozenValue);
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
  const inPlaceTarget = getInPlaceTarget(memo, originalObject, false) as Record<string, unknown> | undefined;
  const keys = Object.keys(value);
  let frozenValue: Record<string, unknown> = inPlaceTarget ?? {};
  let numKeys = 0;
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

    numKeys++;
    reusable &&= item === originalItem;

    if (frozenValue !== inPlaceTarget) {
      // eslint-disable-next-line security/detect-object-injection
      frozenValue[key] = item;
    } else if (item !== originalItem && !setDataProperty(frozenValue, key, item)) {
      // Cannot be frozen in place, clone frozen properties so far.
      frozenValue = cloneObject(frozenValue, value);
      // eslint-disable-next-line security/detect-object-injection
      frozenValue[key] = item;
      replaceAncestor(memo, frozenValue);
    }
  }

  if (frozenValue === inPlaceTarget && !deleteExtraProperties(frozenValue, value, numKeys)) {
    frozenValue = cloneObject(frozenValue, value);
    replaceAncestor(memo, frozenValue);
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

    memo.referenced[+ancestorIndex] = true;

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
        : createReadonlySet(items);

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
 * only read-only `Set` created by `createReadonlySet()` is reused.
 *
 * When `init.clone` is `false`, the caller transfers ownership of the original value. Arrays and objects of the original
 * value are modified and frozen in place instead of cloned: properties are replaced by their frozen versions, and
 * properties not in the validated value (e.g. `undefined`, dangerous keys, symbol keys, and non-enumerable properties)
 * are deleted. If an array or object cannot be frozen in place (e.g. it is sealed, has a non-plain prototype, or has
 * non-configurable properties), it is cloned instead. If it is recursive and cannot be frozen in place, it will throw.
 *
 * @param originalValue Value before validation. Validation could copy or transform the value.
 * @param value Value after validation.
 * @param init.clone `true` (default) to clone arrays and objects before freezing, `false` to freeze them in place.
 */
function deepFreeze<T>(originalValue: unknown, value: T, init?: DeepFreezeInit | undefined): T {
  // Primitives do not need a memo.
  return (!value || typeof value !== 'object'
    ? value
    : deepFreezeWithMemo(originalValue, value, {
        clone: init?.clone ?? true,
        frozenValues: [],
        referenced: [],
        values: []
      })) satisfies unknown as T;
}

type DeepFreezeInit = { readonly clone?: boolean | undefined };

export default deepFreeze;
export { isDangerousKey, type DeepFreezeInit };
