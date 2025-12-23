const FORBIDDEN_PROPERTY_NAMES: readonly string[] = Object.freeze(
  Array.from(
    new Set([
      // As-of writing, `Object.prototype` includes:
      //   __defineGetter__
      //   __defineSetter__
      //   __lookupGetter__
      //   __lookupSetter
      //   __proto__
      //   constructor
      //   hasOwnProperty
      //   isPrototypeOf
      //   propertyIsEnumerable
      //   toLocaleString
      //   toString
      //   valueOf
      ...Object.getOwnPropertyNames(Object.prototype),

      'prototype'
    ])
  )
);

export default function isForbiddenPropertyName(propertyName: string): boolean {
  return FORBIDDEN_PROPERTY_NAMES.includes(propertyName);
}
