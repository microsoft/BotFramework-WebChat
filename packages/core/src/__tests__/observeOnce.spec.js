import { runSaga } from 'redux-saga';
import { all, call } from 'redux-saga/effects';

import observeOnce from '../sagas/effects/observeOnce';

describe('observeOnce', () => {
  let inputOutput;
  let observable;
  let onError;
  let onNext;
  let unsubscribe;

  beforeEach(() => {
    unsubscribe = jest.fn();
    observable = {
      subscribe: jest.fn((...args) => {
        onNext = args[0];
        onError = args[1];

        return {
          unsubscribe
        };
      })
    };

    inputOutput = {
      subscribe() {
        return () => {};
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

            reject('Should not succeed');
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
});
