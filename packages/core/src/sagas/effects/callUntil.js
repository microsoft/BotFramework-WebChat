import { call } from 'redux-saga/effects';

export default function (fn, args, predicate) {
  return call(function* () {
    for (;;) {
      const result = yield call(fn, ...args);

      if (predicate(result)) {
        break;
      }
    }
  });
}
