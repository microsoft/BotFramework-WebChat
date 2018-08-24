import {
  call
} from 'redux-saga/effects';

import createPromiseQueue from '../../createPromiseQueue';

export default function (observable) {
  // TODO: Can we simplify this code and skip PromiseQueue?
  //       We probably still need Deferred
  return call(function* () {
    const queue = createPromiseQueue();
    const subscription = observable.subscribe({ next: queue.push });

    try {
      return yield call(queue.shift);
    } finally {
      subscription.unsubscribe();
    }
  });
}
