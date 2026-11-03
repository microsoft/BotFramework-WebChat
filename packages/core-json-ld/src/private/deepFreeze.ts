import type { ReadonlyDeep } from 'type-fest';

// Flywheel objects to reduce memory footprint.
const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});

export default function deepFreeze<T>(value: T): ReadonlyDeep<typeof value> {
  if (value && value.constructor === Object) {
    const entries = Object.entries(value);

    if (!entries.length) {
      // @ts-expect-error TypeScript does not understand ReadonlyDeep<T>
      return EMPTY_OBJECT;
    }

    const nextEntries: [string, unknown][] = [];

    for (const [key, item] of entries) {
      nextEntries.push([key, deepFreeze(item)]);
    }

    // @ts-expect-error TypeScript does not understand ReadonlyDeep<T>
    return Object.freeze(Object.fromEntries(nextEntries.entries()));
  } else if (Array.isArray(value)) {
    if (!value.length) {
      // @ts-expect-error TypeScript does not understand value.length === 0 means never[].
      return EMPTY_ARRAY;
    }

    const nextArray = [];

    // value.entries() does not do sparse iteration.
    for (const index in value) {
      nextArray[+index] = deepFreeze(value[+index]);
    }

    // @ts-expect-error TypeScript does not understand ReadonlyDeep<T>
    return Object.freeze(nextArray);
  }

  // @ts-expect-error TypeScript does not understand ReadonlyDeep<T>
  return value;
}
