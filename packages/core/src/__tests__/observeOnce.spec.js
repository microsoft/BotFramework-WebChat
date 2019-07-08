/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */

import { runSaga } from 'redux-saga';
import { all, call } from 'redux-saga/effects';

import observeOnce from '../sagas/effects/observeOnce';

describe('observeOnce', () => {
  let inputOutput;
  let observable;
  let onComplete;
  let onError;
  let onNext;
  let unsubscribe;

  beforeEach(() => {
    unsubscribe = jest.fn();
    observable = {
      subscribe: jest.fn((...args) => {
        [onNext, onError, onComplete] = args;

        return {
          unsubscribe
        };
      })
    };

    inputOutput = {
      subscribe() {
        return () => 0;
      }
    };
  });

  test('should unsubscribe after first next', () =>
    new Promise((resolve, reject) => {
      runSaga(inputOutput, function*() {
        try {
          const [result] = yield all([observeOnce(observable), call(() => onNext('Hello, World!'))]);

          expect(observable.subscribe).toHaveBeenCalledTimes(1);
          expect(result).toBe('Hello, World!');
          expect(unsubscribe).toHaveBeenCalledTimes(1);

          resolve();
        } catch (err) {
          reject(err);
        }
      });
    }));

  test('should unsubscribe and throw after first error', () =>
    new Promise((resolve, reject) => {
      runSaga(inputOutput, function*() {
        try {
          try {
            yield all([observeOnce(observable), call(() => onError(new Error('Hello, World!')))]);

            reject(new Error('Should not succeed'));
          } catch (err) {
            expect(() => {
              throw err;
            }).toThrow('Hello, World!');
            expect(unsubscribe).toHaveBeenCalledTimes(1);
          }

          resolve();
        } catch (err) {
          reject(err);
        }
      });
    }));

  test('should unsubscribe after complete', () =>
    new Promise((resolve, reject) => {
      runSaga(inputOutput, function*() {
        try {
          const [result] = yield all([observeOnce(observable), call(() => onComplete())]);

          expect(observable.subscribe).toHaveBeenCalledTimes(1);
          expect(result).toBeUndefined();
          expect(unsubscribe).toHaveBeenCalledTimes(1);

          resolve();
        } catch (err) {
          reject(err);
        }
      });
    }));
});
