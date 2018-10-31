// TODO: [P3] Move to p-defer
export default function createDeferred() {
  let reject, resolve;

  const promise = new Promise((promiseResolve, promiseReject) => {
    reject = promiseReject;
    resolve = promiseResolve;
  });

  if (!reject || !resolve) {
    throw new Error('Promise is not a ES-compliant and do not run exector immediately');
  }

  return { promise, reject, resolve };
}
