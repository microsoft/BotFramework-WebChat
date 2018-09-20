import {
  call
} from 'redux-saga/effects';

export default function (observable) {
  return call(function* () {
    let subscription;

    try {
      return yield call(() => new Promise((resolve, reject) => {
        observable.subscribe(resolve, reject);
      }));
    } finally {
      if (subscription) {
        subscription.unsubscribe();
      }
    }
  });
}
