/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^deleted$" }] */

export default function deleteKey(map, key) {
  if (!map) {
    return map;
  }

  const { [key]: deleted, ...nextMap } = map;

  return nextMap;
}
