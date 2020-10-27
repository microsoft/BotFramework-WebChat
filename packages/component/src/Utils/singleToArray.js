export default function singleToArray(singleOrArray) {
  return singleOrArray ? (Array.isArray(singleOrArray) ? singleOrArray : [singleOrArray]) : [];
}
