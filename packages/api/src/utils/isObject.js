const { toString } = {};

export default function isObject(obj) {
  return toString.call(obj) === '[object Object]';
}
