import Observable from 'core-js/features/observable';

export default function observableToPromise<T>(observable: Observable<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const subscription = observable.subscribe(
      (sessionId: T) => {
        resolve(sessionId);

        // HACK: Sometimes, the call complete asynchronously and we cannot unsubscribe
        //       Need to wait some short time here to make sure the subscription variable has setup
        setTimeout(() => subscription.unsubscribe(), 0);
      },
      (error: Error) => {
        reject(error);
        setTimeout(() => subscription.unsubscribe(), 0);
      }
    );
  });
}
