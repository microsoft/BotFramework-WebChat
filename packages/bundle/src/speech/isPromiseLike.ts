export default function isPromiseLike<T>(promiseLike: unknown): promiseLike is Promise<T> {
  return (
    !!promiseLike && typeof promiseLike === 'object' && 'then' in promiseLike && typeof promiseLike.then === 'function'
  );
}
