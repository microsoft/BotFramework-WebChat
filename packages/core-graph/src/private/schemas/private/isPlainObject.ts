export default function isPlainObject(input: unknown): input is object {
  return Object.prototype.toString.call(input) === '[object Object]';
}
