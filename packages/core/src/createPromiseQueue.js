import createDeferred from 'p-defer-es5';

export default function createPromiseQueue() {
  let deferred;
  const queue = [];

  const push = value => {
    if (deferred) {
      const { resolve } = deferred;

      deferred = null;
      resolve(value);
    } else {
      queue.push(value);
    }
  };

  const shift = () =>
    queue.length ? Promise.resolve(queue.shift()) : (deferred || (deferred = createDeferred())).promise;

  return {
    push,
    shift
  };
}
