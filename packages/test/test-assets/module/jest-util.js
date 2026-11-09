// jest-mock only calls isPromise() from jest-util; the rest of jest-util requires Node.js "fs".
export function isPromise(candidate) {
  return (
    candidate != null &&
    (typeof candidate === 'object' || typeof candidate === 'function') &&
    typeof candidate.then === 'function'
  );
}
