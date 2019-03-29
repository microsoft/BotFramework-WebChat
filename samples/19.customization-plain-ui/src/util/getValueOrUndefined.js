// This function will follow a path to get a value from an object.
// If the path leads to "undefined", we will return "undefined" instead.
export default function getValueOrUndefined(object, ...path) {
  if (typeof object !== 'undefined' && path.length) {
    const key = path.shift();

    return getValueOrUndefined(object[key], ...path);
  } else {
    return object;
  }
}
