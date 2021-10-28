let FORBIDDEN_PROPERTY_NAMES;

function getForbiddenPropertyNames() {
  return (
    FORBIDDEN_PROPERTY_NAMES ||
    (FORBIDDEN_PROPERTY_NAMES = Object.freeze(
      Array.from(
        new Set([
          ...Object.getOwnPropertyNames(Object.prototype),
          '__defineGetter__',
          '__defineSetter__',
          '__lookupGetter__',
          '__lookupSetter',
          '__proto__',
          'constructor',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'prototype',
          'toLocaleString',
          'toString',
          'valueOf'
        ])
      )
    ))
  );
}

export default function isForbiddenPropertyName(propertyName) {
  return getForbiddenPropertyNames().includes(propertyName);
}
