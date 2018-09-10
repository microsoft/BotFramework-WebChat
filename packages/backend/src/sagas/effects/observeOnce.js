import {
  call
} from 'redux-saga/effects';

export default function (observable) {
  return call(function* () {
    let subscription;

    try {
      return yield call(() => new Promise(resolve => {
        observable.subscribe({ next: resolve });
      }));
    } finally {
      subscription && subscription.unsubscribe();
    }
  });
}
