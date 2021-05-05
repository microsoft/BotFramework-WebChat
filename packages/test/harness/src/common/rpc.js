// "selenium-webdriver" is undefined if running under browser.
const random = require('math-random');

const marshal = require('./marshal');
const unmarshal = require('./unmarshal');

/**
 * Enables remoting to an object over receive/send ports using a RPC mechanism.
 *
 * This implementation only support arguments of primitive types. Look at `marshal.js` and `unmarshal.js` for supported types.
 * It does not support arguments of functions, such as callback functions.
 */
module.exports = function rpc(rpcName, fns, [receivePort, sendPort]) {
  const invocations = {};

  receivePort.addEventListener('message', async ({ data }) => {
    const { type } = data || {};

    if (!/^rpc:/u.test(type) || data.rpcName !== rpcName) {
      return;
    }

    data = unmarshal(data);

    /* eslint-disable-next-line default-case */
    switch (type) {
      case 'rpc:call':
        if (data.fn === '__proto__' || data.fn === 'constructor' || data.fn === 'prototype') {
          return;
        }

        try {
          const returnValue = await fns[data.fn](...data.args);

          sendPort.postMessage({
            invocationID: data.invocationID,
            returnValue,
            rpcName,
            type: 'rpc:return'
          });
        } catch ({ message, stack }) {
          sendPort.postMessage({
            error: { message, stack },
            invocationID: data.invocationID,
            rpcName,
            type: 'rpc:error'
          });
        }

        break;

      case 'rpc:return':
        {
          const { [data.invocationID]: { resolve } = {} } = invocations;

          resolve && resolve(data.returnValue);
        }

        break;

      case 'rpc:error':
        {
          const { [data.invocationID]: { reject } = {} } = invocations;
          const error = new Error(data.error.message);

          error.stack = data.error.stack;

          reject && reject(error);
        }

        break;
    }
  });

  return Object.fromEntries(
    Object.entries(fns).map(([fn, value]) => [
      fn,
      typeof value === 'function'
        ? (...args) =>
            new Promise((resolve, reject) => {
              // eslint-disable-next-line no-magic-numbers
              const invocationID = random().toString(36).substr(2, 5);

              invocations[invocationID] = { reject, resolve };

              sendPort.postMessage(marshal({ args, fn, invocationID, rpcName, type: 'rpc:call' }));
            })
        : value
    ])
  );
};
