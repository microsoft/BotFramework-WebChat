export default function iterateAsyncIterable(target) {
  const iteration = target[Symbol.asyncIterator]();

  return {
    async *[Symbol.asyncIterator]() {
      for (;;) {
        const { done, value } = await iteration.next();

        if (done) {
          break;
        }

        yield value;
      }
    }
  };
}
