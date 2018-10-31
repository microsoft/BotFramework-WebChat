import createDeferred from './createDeferred';

export default function () {
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

  const shift = () => {
    if (queue.length) {
      return Promise.resolve(queue.shift());
    } else {
      return (deferred || (deferred = createDeferred())).promise;
    }
  };

  return {
    push,
    shift
  }
}
