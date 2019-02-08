export default function observableToPromise(observable) {
  return new Promise((resolve, reject) => {
    const subscription = observable.subscribe(sessionId => {
      resolve(sessionId);

      // HACK: Sometimes, the call complete asynchronously and we cannot unsubscribe
      //       Need to wait some short time here to make sure the subscription variable has setup
      setImmediate(() => subscription.unsubscribe());
    }, error => {
      reject(error);
      setImmediate(() => subscription.unsubscribe());
    });
  });
}
