import {
  call,
  race
} from 'redux-saga/effects';

import sleep from '../../util/sleep';

export default function (fn, args, timeout) {
  return call(function* () {
    const [result] = yield race([
      call(fn, ...args),
      call(() => sleep(timeout).then(() => Promise.reject(new Error('timeout'))))
    ]);

    return result;
  });
}
