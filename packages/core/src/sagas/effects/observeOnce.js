import { call } from 'redux-saga/effects';

export default function observeOnceEffect(observable) {
  return call(function* observeOnce() {
    let subscription;

    try {
      return yield call(
        () =>
          new Promise((resolve, reject) => {
            subscription = observable.subscribe(resolve, reject, resolve);
          })
      );
    } finally {
      subscription && subscription.unsubscribe();
    }
  });
}
