import { call } from 'redux-saga/effects';

export default function callUntilEffect(fn, args, predicate) {
  return call(function* callUntil() {
    for (;;) {
      const result = yield call(fn, ...args);

      if (predicate(result)) {
        break;
      }
    }
  });
}
