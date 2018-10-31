import { call } from 'redux-saga/effects';

const promiseSingleton = new Promise(() => 0);
const getPromise = () => promiseSingleton;

// This function, although looks weird, help improving coding pattern on redux-saga
export default function () {
  return call(getPromise);
}
