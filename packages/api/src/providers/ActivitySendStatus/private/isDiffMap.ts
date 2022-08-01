/**
 * Returns `true` if both `Map` are different, otherwise, `false`.
 *
 * The equality of the value is compared using `Object.is`.
 */
export default function isDiffMap<K, V>(x: ReadonlyMap<K, V>, y: ReadonlyMap<K, V>): boolean {
  const xKeys = new Set(x?.keys());
  const yKeys = new Set(y?.keys());

  if (xKeys.size !== yKeys.size) {
    return true;
  }

  for (const key of yKeys) {
    xKeys.add(key);
  }

  if (xKeys.size !== yKeys.size) {
    return true;
  }

  for (const key of xKeys) {
    if (!Object.is(x.get(key), y.get(key))) {
      return true;
    }
  }

  return false;
}
