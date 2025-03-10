import { call } from 'redux-saga/effects';

import { Observable, Observer, Subscription } from '../../types/external/Observable';

export default function observeOnceEffect<T>(observable: Observable<T>) {
  return call(function* observeOnce() {
    let subscription: Subscription;

    try {
      return yield call(
        () =>
          new Promise<T>((resolve, reject) => {
            subscription = observable.subscribe({
              complete: resolve,
              error: reject,
              next: resolve
            } as Observer<T>);
          })
      );
    } finally {
      subscription && subscription.unsubscribe();
    }
  });
}
