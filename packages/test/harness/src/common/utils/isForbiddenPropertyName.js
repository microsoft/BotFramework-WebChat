let FORBIDDEN_PROPERTY_NAMES;

function getForbiddenPropertyNames() {
  return (
    FORBIDDEN_PROPERTY_NAMES ||
    (FORBIDDEN_PROPERTY_NAMES = Object.freeze(
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
    ))
  );
}

module.exports = function isForbiddenPropertyName(propertyName) {
  return getForbiddenPropertyNames().includes(propertyName);
};
