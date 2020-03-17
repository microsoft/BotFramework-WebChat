import { call } from 'redux-saga/effects';

export default function observeOnceEffect(observable) {
  return call(function* observeOnce() {
    let subscription;

    try {
      return yield call(
        () =>
          new Promise((resolve, reject) => {
            subscription = observable.subscribe({
              complete: resolve,
              error: reject,
              next: resolve
            });
          })
      );
    } finally {
      subscription && subscription.unsubscribe();
    }
  });
}
