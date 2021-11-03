export default function iterateAsyncIterable(target) {
  const iteration = target[Symbol.asyncIterator]();

  return {
    async *[Symbol.asyncIterator]() {
      for (;;) {
        // This is an iteration loop and await in loop is intentional.
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await iteration.next();

        if (done) {
          break;
        }

        yield value;
      }
    }
  };
}
