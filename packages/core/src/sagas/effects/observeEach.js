import { call } from 'redux-saga/effects';

import createPromiseQueue from '../../createPromiseQueue';

export default function observeEachEffect(observable, saga) {
  return call(function* observeEach() {
    const queue = createPromiseQueue();
    const subscription = observable.subscribe({ next: queue.push });

    try {
      for (;;) {
        const result = yield call(queue.shift);

        yield call(saga, result);
      }
    } finally {
      subscription.unsubscribe();
    }
  });
}
