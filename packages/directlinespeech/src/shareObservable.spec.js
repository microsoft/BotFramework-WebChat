/** @jest-environment jsdom */

import Observable from 'core-js/features/observable';

import shareObservable from './shareObservable';

test('should only subscribe when there is at least one subscriber', () => {
  const observerCallback = jest.fn();
  const parent = new Observable(observerCallback);
  const sharedParent = shareObservable(parent);

  expect(observerCallback).toHaveBeenCalledTimes(0);

  sharedParent.subscribe();

  expect(observerCallback).toHaveBeenCalledTimes(1);
});

test('should unsubscribe when there are no subscribers', () => {
  const unsubscribe = jest.fn();
  const observerCallback = jest.fn(() => () => unsubscribe());
  const parent = new Observable(observerCallback);
  const sharedParent = shareObservable(parent);

  const subscriptions = sharedParent.subscribe();

  expect(unsubscribe).toHaveBeenCalledTimes(0);

  subscriptions.unsubscribe();

  expect(unsubscribe).toHaveBeenCalledTimes(1);
});

test('should call next/complete for all subscribers', () => {
  const observerCallback = jest.fn();
  const parent = new Observable(observerCallback);
  const sharedParent = shareObservable(parent);

  const complete1 = jest.fn();
  const next1 = jest.fn();

  sharedParent.subscribe({
    complete: complete1,
    next: next1
  });

  const complete2 = jest.fn();
  const next2 = jest.fn();

  sharedParent.subscribe({
    complete: complete2,
    next: next2
  });

  expect(next1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledTimes(0);

  const [[observer]] = observerCallback.mock.calls;

  observer.next('Hello, World!');

  expect(next1).toHaveBeenCalledTimes(1);
  expect(next1).toHaveBeenCalledWith('Hello, World!');
  expect(next2).toHaveBeenCalledTimes(1);
  expect(next2).toHaveBeenCalledWith('Hello, World!');

  expect(complete1).toHaveBeenCalledTimes(0);
  expect(complete2).toHaveBeenCalledTimes(0);

  observer.complete();

  expect(complete1).toHaveBeenCalledTimes(1);
  expect(complete2).toHaveBeenCalledTimes(1);
});

test('should call error for all subscribers', () => {
  const observerCallback = jest.fn();
  const parent = new Observable(observerCallback);
  const sharedParent = shareObservable(parent);

  const error1 = jest.fn();

  sharedParent.subscribe({ error: error1 });

  const error2 = jest.fn();

  sharedParent.subscribe({ error: error2 });

  expect(error1).toHaveBeenCalledTimes(0);
  expect(error2).toHaveBeenCalledTimes(0);

  const error = new Error('artificial');

  const [[observer]] = observerCallback.mock.calls;

  observer.error(error);

  expect(error1).toHaveBeenCalledTimes(1);
  expect(error1).toHaveBeenCalledWith(error);
  expect(error2).toHaveBeenCalledTimes(1);
  expect(error2).toHaveBeenCalledWith(error);
});
