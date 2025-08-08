/// <reference types="jest" />

import createWaitUntilable, { type WaitUntilable } from './createWaitUntilable';

type Deferred<T> = {
  promise: Promise<T>;
  reject: (error: unknown) => void;
  resolve: (value: T) => void;
};

function createDeferred<T>(): Deferred<T> {
  const deferred: Partial<Deferred<T>> = {};

  deferred.promise = new Promise<T>((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred as Deferred<T>;
}

function hasResolve(promise): Promise<boolean> {
  // eslint-disable-next-line no-restricted-globals
  return Promise.race([promise.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 0))]);
}

describe('with no waitUntil()', () => {
  let getPromise: () => Promise<void>;
  let promise: Promise<void>;

  beforeEach(() => {
    [, getPromise] = createWaitUntilable({});

    promise = getPromise();
  });

  test('should resolve initially', () => expect(hasResolve(promise)).resolves.toBe(true));
});

describe('With a single waitUntil()', () => {
  let event: WaitUntilable<any>;
  let getPromise: () => Promise<void>;
  let promise: Promise<void>;
  let deferred: Deferred<void>;

  beforeEach(() => {
    [event, getPromise] = createWaitUntilable({});

    deferred = createDeferred();
    event.waitUntil(deferred.promise);
    promise = getPromise();
  });

  test('should not resolve initially', () => expect(hasResolve(promise)).resolves.toBe(false));

  describe('after waitUntil() has resolved', () => {
    beforeEach(() => deferred.resolve());

    test('should resolve', () => expect(hasResolve(promise)).resolves.toBe(true));
  });
});

describe('With nested waitUntil()', () => {
  let event: WaitUntilable<any>;
  let getPromise: () => Promise<void>;
  let promise: Promise<void>;
  let deferred1: Deferred<void>;
  let deferred2: Deferred<void>;

  beforeEach(() => {
    [event, getPromise] = createWaitUntilable({});

    deferred1 = createDeferred();
    deferred2 = createDeferred();

    event.waitUntil(
      (async () => {
        await deferred1.promise;

        event.waitUntil(deferred2.promise);
      })()
    );

    promise = getPromise();
  });

  test('should not resolve initially', () => expect(hasResolve(promise)).resolves.toBe(false));

  describe('after first waitUntil() is resolved', () => {
    beforeEach(() => deferred1.resolve());

    test('should not resolve', () => expect(hasResolve(promise)).resolves.toBe(false));

    describe('after second waitUntil() is resolved', () => {
      beforeEach(() => deferred2.resolve());

      test('should resolve', () => expect(hasResolve(promise)).resolves.toBe(true));
    });
  });
});
