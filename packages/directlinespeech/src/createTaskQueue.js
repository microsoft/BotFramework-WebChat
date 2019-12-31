import createDeferred from 'p-defer-es5';

export default function createTaskQueue() {
  let queueWithCurrent = [];

  const queue = {
    cancelAll: () => {
      queueWithCurrent.forEach(({ cancel }) => cancel());
    },
    push: fn => {
      const cancelDeferred = createDeferred();
      const resultDeferred = createDeferred();
      const entry = { promise: resultDeferred.promise };
      let abort;

      const cancel = (entry.cancel = () => {
        // Override the "fn" so we don't call the actual "fn" later.
        // In this approach, we can reuse the logic inside "start" to handle post-cancellation.
        fn = () => ({ result: Promise.reject(new Error('cancelled before start')) });

        // Abort the task if it is currently running.
        abort && abort();
        cancelDeferred.reject(new Error('cancelled in the midway'));
      });

      const start = async () => {
        const { abort: abortFn, result } = fn();

        abort = abortFn;

        try {
          // Either wait for the actual result, or the task is being cancelled.
          resultDeferred.resolve(await Promise.race([result, cancelDeferred.promise]));
        } catch (error) {
          resultDeferred.reject(error);
        }

        queueWithCurrent = queueWithCurrent.filter(e => e !== entry);
      };

      const lastEntry = queueWithCurrent[queueWithCurrent.length - 1];
      const lastPromise = (lastEntry && lastEntry.promise) || Promise.resolve();

      queueWithCurrent.push(entry);

      // After the last promise resolved/rejected, we will start this task.
      // We will start even if the last promise rejected.
      lastPromise.then(start, start);

      return {
        cancel,
        result: resultDeferred.promise
      };
    }
  };

  Object.defineProperty(queue, 'length', { get: () => queueWithCurrent.length });

  return queue;
}
