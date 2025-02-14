export type WaitUntilable<T> = T & { waitUntil: (promise: Promise<void>) => void };

export default function createWaitUntilable<T extends Record<any, any>>(
  object: T
): readonly [WaitUntilable<T>, () => Promise<void>] {
  const allPromises: Promise<void>[] = [];

  return Object.freeze([
    {
      ...object,
      waitUntil(promise: Promise<void>) {
        allPromises.push(promise);
      }
    },
    async () => {
      // Implements the logic of ExtendableEvent.waitUntil.
      // When calling waitUntil(), new promises can be added by calling waitUntil() again.
      // It should wait until no new promises are added.

      // From excerpt of https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil:
      // "The waitUntil() method must be initially called within the event callback, but after that it can be called multiple times, until all the promises passed to it settle."
      for (let numPromise = 0; ; numPromise = allPromises.length) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(allPromises).then(() => {
          // Intentionally left blank.
        });

        // Wait until all promise changes are settled.
        if (numPromise === allPromises.length) {
          break;
        }
      }
    }
  ]);
}
