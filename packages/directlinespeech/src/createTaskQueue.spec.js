/** @jest-environment jsdom */

/* eslint no-magic-numbers: "off" */

import createDeferred from 'p-defer-es5';
import createTaskQueue from './createTaskQueue';

function createTask() {
  const abort = jest.fn();
  const resultDeferred = createDeferred();
  const startedDeferred = createDeferred();

  return {
    abort,
    fn: jest.fn(() => {
      startedDeferred.resolve();

      return {
        abort,
        result: resultDeferred.promise
      };
    }),
    reject: resultDeferred.reject,
    resolve: resultDeferred.resolve,
    started: startedDeferred.promise
  };
}

describe('with 2 tasks', () => {
  let queue;
  let task1;
  let task2;
  let task3;

  beforeEach(() => {
    queue = createTaskQueue();

    task1 = createTask();
    task2 = createTask();
    task3 = createTask();
  });

  test('queued simultaneously with resolves and rejects', async () => {
    expect(task1.fn).toHaveBeenCalledTimes(0);

    const { cancel: _cancel1, result: result1 } = queue.push(task1.fn);
    const { cancel: _cancel2, result: result2 } = queue.push(task2.fn);
    const { cancel: _cancel3, result: result3 } = queue.push(task3.fn);

    expect(queue.length).toBe(3);

    await task1.started;
    expect(task1.fn).toHaveBeenCalledTimes(1);
    expect(task2.fn).toHaveBeenCalledTimes(0);
    expect(task3.fn).toHaveBeenCalledTimes(0);

    task1.resolve(1);
    await expect(result1).resolves.toBe(1);
    expect(queue.length).toBe(2);

    // After first task has been resolved, the second task will start momentarily.
    await task2.started;
    expect(task2.fn).toHaveBeenCalledTimes(1);

    task2.reject(new Error('rejected'));
    await expect(result2).rejects.toThrow('rejected');
    expect(queue.length).toBe(1);

    // After second task has been rejected, the third task should start normally.
    await task3.started;
    expect(task3.fn).toHaveBeenCalledTimes(1);

    task3.resolve(3);
    await expect(result3).resolves.toBe(3);
    expect(queue.length).toBe(0);
  });

  test('queued one by one', async () => {
    expect(task1.fn).toHaveBeenCalledTimes(0);
    expect(task2.fn).toHaveBeenCalledTimes(0);

    const { cancel: _cancel1, result: result1 } = queue.push(task1.fn);

    expect(queue.length).toBe(1);

    await task1.started;
    expect(task1.fn).toHaveBeenCalledTimes(1);
    task1.resolve(1);
    await expect(result1).resolves.toBe(1);
    expect(queue.length).toBe(0);

    const { cancel: _cancel2, result: result2 } = queue.push(task2.fn);

    expect(queue.length).toBe(1);

    // After the queue suspended due to no pending tasks, when queueing a new task, it should start imemdiately.
    await task2.started;
    expect(task2.fn).toHaveBeenCalledTimes(1);
    task2.resolve(2);
    await expect(result2).resolves.toBe(2);
    expect(queue.length).toBe(0);
  });

  test('queued simultaneously, abort the first task should continue the second task', async () => {
    expect(task1.fn).toHaveBeenCalledTimes(0);

    const { cancel: cancel1, result: result1 } = queue.push(task1.fn);
    const { cancel: _cancel2, result: result2 } = queue.push(task2.fn);

    expect(queue.length).toBe(2);

    await task1.started;
    expect(task1.fn).toHaveBeenCalledTimes(1);
    expect(task2.fn).toHaveBeenCalledTimes(0);

    cancel1();

    // When cancelling an active task, it should reject with "cancelled" error.
    await expect(result1).rejects.toThrow('cancelled in the midway');

    await task2.started;
    expect(queue.length).toBe(1);
    expect(task2.fn).toHaveBeenCalledTimes(1);

    task2.resolve(2);
    await expect(result2).resolves.toBe(2);
    expect(queue.length).toBe(0);
  });

  test('queued simultaneously, abort the second task should dequeue the task without starting it', async () => {
    expect(task1.fn).toHaveBeenCalledTimes(0);

    const { cancel: _cancel1, result: result1 } = queue.push(task1.fn);
    const { cancel: cancel2, result: result2 } = queue.push(task2.fn);
    const { cancel: _cancel3, result: result3 } = queue.push(task3.fn);

    expect(queue.length).toBe(3);

    await task1.started;
    expect(task1.fn).toHaveBeenCalledTimes(1);
    expect(task2.fn).toHaveBeenCalledTimes(0);
    expect(task3.fn).toHaveBeenCalledTimes(0);

    const reject2 = jest.fn();

    result2.catch(reject2);

    // This is actually mark the task as cancelled.
    // Only when task 1 completed, task 2 will get cancelled. Also for cancellation before start, task 2 will not get started.
    cancel2();

    // Although task 2 is cancelled, it is still on the queue until we start it.
    // We should not reject it immediately. We should wait until task 1 has completed, before rejecting task 2.
    expect(reject2).toHaveBeenCalledTimes(0);

    task1.resolve(1);
    await expect(result1).resolves.toBe(1);

    await task3.started;

    // We only reject task 2 after the first task has been resolved.
    expect(reject2).toHaveBeenCalledTimes(1);
    await expect(result2).rejects.toThrow('cancelled before start');

    // We cannot check the queue length because the dequeue is asynchronous and cannot guarantee when the dequeue will complete.
    // We can only check the queue when a task is definitely started.
    // In this test, if task 3 is started, we are sure task 2 has been rejected and dequeued.
    expect(queue.length).toBe(1);

    expect(task3.fn).toHaveBeenCalledTimes(1);
    task3.resolve(3);
    await expect(result3).resolves.toBe(3);
    expect(queue.length).toBe(0);

    // Task 2 start should have never been called
    expect(task2.fn).toHaveBeenCalledTimes(0);
  });

  test('queued simultaneously and cancel all at once', async () => {
    expect(task1.fn).toHaveBeenCalledTimes(0);

    const { cancel: _cancel1, result: result1 } = queue.push(task1.fn);
    const { cancel: _cancel2, result: result2 } = queue.push(task2.fn);
    const { cancel: _cancel3, result: result3 } = queue.push(task3.fn);

    expect(queue.length).toBe(3);
    await task1.started;
    expect(task1.fn).toHaveBeenCalledTimes(1);

    queue.cancelAll();

    await expect(result1).rejects.toThrow('cancelled in the midway');
    await expect(result2).rejects.toThrow('cancelled before start');
    await expect(result3).rejects.toThrow('cancelled before start');

    expect(queue.length).toBe(0);
  });
});
