import { fork, put } from 'redux-saga/effects';

// In redux-saga, if we call the following effects in order, we might miss the take('C').
// 1. take('A')
// 2. put({ type: 'B' })
// 3. take('C')

// We need to modify step 2 to:
// 2. fork(function* () { yield put({ type: 'B' }) })

// This is a helper function for this purpose.

export default function forkPutEffect(...actions) {
  return fork(function* forkPut() {
    for (const action of actions) {
      yield put(action);
    }
  });
}
