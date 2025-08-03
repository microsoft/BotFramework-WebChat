import { withResolvers } from '@msinternal/botframework-webchat-base/utils';

export default function createPromiseQueue() {
  let promiseWithResolvers;
  const queue = [];

  const push = value => {
    if (promiseWithResolvers) {
      const { resolve } = promiseWithResolvers;

      promiseWithResolvers = null;
      resolve(value);
    } else {
      queue.push(value);
    }
  };

  const shift = () =>
    queue.length
      ? Promise.resolve(queue.shift())
      : (promiseWithResolvers || (promiseWithResolvers = withResolvers())).promise;

  return {
    push,
    shift
  };
}
