export default function arrayify(items) {
  return Array.isArray(items) ? items : (typeof items === 'undefined' || items === null) ? [] : [items];
}
