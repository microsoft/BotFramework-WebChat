import Observable from 'core-js/features/observable';

import type { GlobalScopePonyfill } from 'botframework-webchat-core';

export default function observableToPromise<T>(
  observable: Observable<T>,
  { setTimeout }: GlobalScopePonyfill
): Promise<T> {
  return new Promise((resolve, reject) => {
    const subscription = observable.subscribe(
      (sessionId: T) => {
        resolve(sessionId);

        // HACK: Sometimes, the call complete asynchronously and we cannot unsubscribe.
        //       Need to wait some short time here to make sure the subscription variable has setup.
        //       Potentially, this can be fixed by assigning to `subscription` variable thru `Observer.start`.
        //       However, we should do some testing because we are not sure if RxJS@5 supports `Observer.start`.
        setTimeout(() => subscription.unsubscribe(), 0);
      },
      (error: Error) => {
        reject(error);
        setTimeout(() => subscription.unsubscribe(), 0);
      }
    );
  });
}
