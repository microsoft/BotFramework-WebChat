import AbortController from 'abort-controller';
import createDeferred from 'p-defer';
import Observable from 'core-js/features/observable';

import sleep from './sleep';

const ABORT_SYMBOL = Symbol();

export default function createJobObservable(driver, { ignorePageError = false } = {}) {
  return new Observable(observer => {
    const abortController = new AbortController();
    const abortPromise = new Promise(resolve =>
      abortController.signal.addEventListener('abort', () => resolve(ABORT_SYMBOL))
    );

    (async function() {
      for (;;) {
        const job = await Promise.race([driver.executeScript(() => window.WebChatTest.jobs.acquire()), abortPromise]);

        if (!job) {
          await sleep(50);
          continue;
        }

        if (job === ABORT_SYMBOL) {
          break;
        } else if (job.type === 'done') {
          observer.complete();
          break;
        } else if (job.type === 'error') {
          observer.error(
            new Error(`Unhandled exception from the test code on the page.\n\n${job.payload.error.stack}`)
          );
          break;
        } else if (job.type === 'pageerror') {
          if (!ignorePageError) {
            observer.error(new Error(`The page emitted an "error" event.\n\n${job.payload.error.stack}`));
            break;
          }
        } else {
          const deferred = createDeferred();

          observer.next({
            deferred,
            job
          });

          await deferred.promise.then(
            (result = null) =>
              driver.executeScript((id, result) => window.WebChatTest.jobs.resolve(id, result), job.id, result),
            async error => {
              await driver.executeScript(
                (id, stack) => window.WebChatTest.jobs.reject(id, new Error(stack)),
                job.id,
                error.stack
              );

              observer.error(error);
            }
          );
        }
      }
    })();

    return () => abortController.abort();
  });
}
