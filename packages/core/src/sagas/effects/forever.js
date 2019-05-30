import { call } from 'redux-saga/effects';

const promiseSingleton = new Promise(() => 0);
const getPromise = () => promiseSingleton;

// This function helps improve our coding pattern on redux-saga
export default function foreverEffect() {
  return call(getPromise);
}
