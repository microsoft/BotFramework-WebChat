export default function shallowEquals(x, y) {
  if (x === y) {
    return true;
  }

  const xKeys = Object.keys(x);
  const yKeys = Object.keys(y);

  return xKeys.length === yKeys.length && xKeys.every(key => yKeys.includes(key) && x[key] === y[key]);
}
