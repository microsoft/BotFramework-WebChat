/* eslint-disable no-magic-numbers, no-restricted-globals */
// The scripts of the connection parity spec: the 9 scenarios of `__tests__/connectSaga.spec.js`, slow connections
// (`__tests__/detectSlowConnectionSaga.spec.js`), user IDs, Direct Line swaps, reference grammar ID, the html2 emulator,
// and the fatal path (an error in a saga stops all of them).
import type { MockDirectLineInit } from './createMockDirectLine';
import type { Script, ScriptContext } from './runParityScript';

// A JWT with { "user": "u-token" }, unsigned (jwt-decode does not verify).
const TOKEN_WITH_USER = `${btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))}.${btoa(JSON.stringify({ user: 'u-token' }))}.`;

// DirectLineJS: `connectionStatus$` is a `BehaviorSubject`, starting at 0 (uninitialized).
const DIRECT_LINE: MockDirectLineInit = Object.freeze({ name: 'dl1', replayStatus: true });

async function connectOnline(
  { createDirectLine, driver, step }: ScriptContext,
  init: MockDirectLineInit = DIRECT_LINE
): Promise<ReturnType<ScriptContext['createDirectLine']>> {
  const mock = createDirectLine(init);

  await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
  await step('status 1', () => mock.emitStatus(1));
  await step('status 2', () => mock.emitStatus(2));

  return mock;
}

const connectionScripts: Readonly<Record<string, Script>> = Object.freeze({
  // __tests__/connectSaga.spec.js
  'connect successfully': async context => {
    await connectOnline(context);
  },
  'connect failed initially': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine(DIRECT_LINE);

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
    await step('status 1', () => mock.emitStatus(1));
    await step('status 4', () => mock.emitStatus(4));
  },
  'connection failed after established': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine(DIRECT_LINE);

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
    await step('status 1, 2, 4', () => {
      mock.emitStatus(1);
      mock.emitStatus(2);
      mock.emitStatus(4);
    });
  },
  'disconnect before connection established': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine(DIRECT_LINE);

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
    await step('status 1', () => mock.emitStatus(1));
    await step('disconnect', () => driver.disconnect());
    await step('status 2 after disconnect', () => mock.emitStatus(2));
  },
  'disconnect after connection established': async context => {
    const mock = await connectOnline(context);

    await context.step('disconnect', () => context.driver.disconnect());
    await context.step('status 1 after disconnect', () => mock.emitStatus(1));
  },
  'reconnect after connection established': async context => {
    const mock = await connectOnline(context);

    await context.step('status 1', () => mock.emitStatus(1));
    await context.step('status 2', () => mock.emitStatus(2));
  },
  'reconnect failed': async context => {
    const mock = await connectOnline(context);

    await context.step('status 1, 4', () => {
      mock.emitStatus(1);
      mock.emitStatus(4);
    });
  },
  'disconnect when reconnecting': async context => {
    const mock = await connectOnline(context);

    await context.step('status 1', () => mock.emitStatus(1));
    await context.step('disconnect', () => context.driver.disconnect());
  },
  'disconnect after reconnected': async context => {
    const mock = await connectOnline(context);

    await context.step('status 1, 2', () => {
      mock.emitStatus(1);
      mock.emitStatus(2);
    });
    await context.step('disconnect', () => context.driver.disconnect());
  },
  'statuses in one turn': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine(DIRECT_LINE);

    await step('connect, status 1, 2, 1, 2, 3', () => {
      driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' });
      mock.emitStatus(1);
      mock.emitStatus(2);
      mock.emitStatus(1);
      mock.emitStatus(2);
      mock.emitStatus(3);
    });
  },
  'status 5 while online': async context => {
    const mock = await connectOnline(context);

    await context.step('status 5', () => mock.emitStatus(5));
  },
  'status 3 while connecting': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine(DIRECT_LINE);

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
    await step('status 3', () => mock.emitStatus(3));
  },
  'disconnect while idle': async ({ driver, step }) => {
    await step('disconnect', () => driver.disconnect());
  },
  'connect again after a failure': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine(DIRECT_LINE);

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
    await step('status 4', () => mock.emitStatus(4));
    await step('connect again', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
    await step('status 2', () => mock.emitStatus(2));
  },
  'disconnect and connect in one turn': async context => {
    const mock = await connectOnline(context);

    await context.step('disconnect, connect', () => {
      context.driver.disconnect();
      context.driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' });
    });
    await context.step('status 2', () => mock.emitStatus(2));
  },

  // __tests__/detectSlowConnectionSaga.spec.js
  'slow connection': async ({ clock, createDirectLine, driver, step }) => {
    const mock = createDirectLine(DIRECT_LINE);

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
    await step('status 1', () => mock.emitStatus(1));
    await step('14999 ms', () => clock.tick(14_999));
    await step('1 ms', () => clock.tick(1));
    await step('status 2', () => mock.emitStatus(2));
    await step('15000 ms', () => clock.tick(15_000));
  },
  'slow reconnection': async context => {
    const mock = await connectOnline(context);

    await context.step('status 1', () => mock.emitStatus(1));
    await context.step('15000 ms', () => context.clock.tick(15_000));
    await context.step('status 2', () => mock.emitStatus(2));
    await context.step('15000 ms again', () => context.clock.tick(15_000));
  },
  'slow, then failed': async ({ clock, createDirectLine, driver, step }) => {
    const mock = createDirectLine(DIRECT_LINE);

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
    await step('15000 ms', () => clock.tick(15_000));
    await step('status 4', () => mock.emitStatus(4));
  },
  'race between slow and reconnect (#2655)': async context => {
    const mock = await connectOnline(context);

    await context.step('status 1', () => mock.emitStatus(1));
    await context.step('status 2, 15000 ms', () => {
      mock.emitStatus(2);
      context.clock.tick(15_000);
    });
  },

  // User ID
  'user ID from the token wins': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine({ ...DIRECT_LINE, token: TOKEN_WITH_USER });

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
  },
  'user ID same as the token': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine({ ...DIRECT_LINE, token: TOKEN_WITH_USER });

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-token', username: 'User' }));
  },
  'no user ID': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine(DIRECT_LINE);

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: '', username: '' }));
  },
  'user ID prefixed with dl_': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine(DIRECT_LINE);

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'dl_1', username: 'User' }));
  },
  'user ID not a string': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine(DIRECT_LINE);

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 123, username: 'User' }));
  },
  'Direct Line without setUserId()': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine({ ...DIRECT_LINE, noSetUserId: true });

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
  },

  // offlineUI/invalidCredentials.html: every subscription of `connectionStatus$` gets 4 (failed) right after 2.
  'failed right after online, on every subscription': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine(DIRECT_LINE);
    const directLine = {
      ...mock.directLine,
      connectionStatus$: {
        subscribe: (observer: { next: (value: number) => void }) =>
          mock.directLine.connectionStatus$.subscribe({
            next: (value: number) => {
              observer.next(value);
              value === 2 && observer.next(4);
            }
          })
      }
    };

    await step('connect', () => driver.connect({ directLine, userID: 'u-1', username: 'User' }));
    await step('status 1', () => mock.emitStatus(1));
    await step('status 2', () => mock.emitStatus(2));
  },

  // Chat adapters without end() (offlineUI/invalidCredentials.html): the sagas fail the connection, it is not fatal.
  'Direct Line without end(): disconnect after online': async context => {
    const mock = await connectOnline(context, { ...DIRECT_LINE, noEnd: true });

    await context.step('disconnect', () => context.driver.disconnect());
    await context.step('connect again', () =>
      context.driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' })
    );
  },
  'Direct Line without end(): failed after online': async context => {
    const mock = await connectOnline(context, { ...DIRECT_LINE, noEnd: true });

    await context.step('status 4', () => mock.emitStatus(4));
  },
  'Direct Line without end(): disconnect while reconnecting': async context => {
    const mock = await connectOnline(context, { ...DIRECT_LINE, noEnd: true });

    await context.step('status 1', () => mock.emitStatus(1));
    await context.step('disconnect', () => context.driver.disconnect());
  },
  'Direct Line without end(): disconnect while connecting': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine({ ...DIRECT_LINE, noEnd: true });

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
    await step('disconnect', () => driver.disconnect());
  },

  // Swaps, as the providers do them: disconnect, then connect.
  'swap Direct Line': async context => {
    await connectOnline(context);

    const mock2 = context.createDirectLine({ ...DIRECT_LINE, name: 'dl2' });

    await context.step('disconnect, connect dl2', () => {
      context.driver.disconnect();
      context.driver.connect({ directLine: mock2.directLine, userID: 'u-2', username: 'User 2' });
    });
    await context.step('dl2 status 1, 2', () => {
      mock2.emitStatus(1);
      mock2.emitStatus(2);
    });
  },
  'connect another Direct Line without disconnecting': async context => {
    const mock1 = await connectOnline(context);
    const mock2 = context.createDirectLine({ ...DIRECT_LINE, name: 'dl2' });

    await context.step('connect dl2', () =>
      context.driver.connect({ directLine: mock2.directLine, userID: 'u-2', username: 'User 2' })
    );
    await context.step('dl2 status 2', () => mock2.emitStatus(2));
    await context.step('dl1 status 1', () => mock1.emitStatus(1));
    await context.step('disconnect', () => context.driver.disconnect());
  },

  // Reference grammar ID
  'reference grammar ID': async context => {
    const mock = context.createDirectLine({ ...DIRECT_LINE, referenceGrammarId: 'g-1' });

    await context.step('connect', () =>
      context.driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' })
    );
    await context.step('status 2', () => mock.emitStatus(2));
    await context.step('changed, status 2', () => {
      mock.setReferenceGrammarId('g-2');
      mock.emitStatus(2);
    });
    await context.step('removed, status 1, 2', () => {
      mock.setReferenceGrammarId(undefined);
      mock.emitStatus(1);
      mock.emitStatus(2);
    });
    await context.step('set again, disconnect', () => {
      mock.setReferenceGrammarId('g-3');
      context.driver.disconnect();
    });
  },

  // The html2 emulator emits status 1 on an `activity$` subscription, then 2 a turn later.
  'emulator: status 1 on each of the first 3 activity$ subscriptions': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine({
      name: 'dl1',
      onActivitySubscribe: (mock, count) => {
        // Not forever: the cycle stops after 3 subscriptions.
        if (count <= 3) {
          mock.emitStatus(1);
          Promise.resolve().then(() => mock.emitStatus(2));
        }
      }
    });

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
    await step('disconnect', () => driver.disconnect());
  },
  'emulator: status 1 on the first activity$ subscription': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine({
      name: 'dl1',
      onActivitySubscribe: (mock, count) => {
        if (count === 1) {
          mock.emitStatus(1);
          Promise.resolve().then(() => mock.emitStatus(2));
        }
      }
    });

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
    await step('reconnect', () => mock.emitStatus(1));
    await step('reconnected', () => mock.emitStatus(2));
    await step('disconnect', () => driver.disconnect());
  },

  // Fatal: an error in a saga stops all of them.
  'fatal: a listener of the status throws on connected': async context => {
    context.faults.statusListenerThrowsOn = 'connected';

    const mock = await connectOnline(context);

    await context.step('status 1', () => mock.emitStatus(1));
    await context.step('disconnect', () => context.driver.disconnect());
    await context.step('connect again', () =>
      context.driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' })
    );
  },
  'fatal: a listener of the status throws on reconnecting': async context => {
    context.faults.statusListenerThrowsOn = 'reconnecting';

    const mock = await connectOnline(context);

    await context.step('status 1', () => mock.emitStatus(1));
    await context.step('status 2', () => mock.emitStatus(2));
    await context.step('disconnect', () => context.driver.disconnect());
  },
  'fatal: a listener of the status throws on connectingslow': async ({
    clock,
    createDirectLine,
    driver,
    faults,
    step
  }) => {
    faults.statusListenerThrowsOn = 'connectingslow';

    const mock = createDirectLine(DIRECT_LINE);

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
    await step('15000 ms', () => clock.tick(15_000));
    await step('status 2', () => mock.emitStatus(2));
    await step('activity', () =>
      mock.emitActivity({
        from: { id: 'bot', role: 'bot' },
        id: '1',
        text: '1',
        timestamp: new Date(1).toISOString(),
        type: 'message'
      })
    );
    await step('disconnect', () => driver.disconnect());
    await step('connect again', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
  },
  'fatal: a listener of the status throws on notconnected': async context => {
    context.faults.statusListenerThrowsOn = 'notconnected';

    const mock = await connectOnline(context);

    await context.step('disconnect', () => context.driver.disconnect());
    await context.step('status 1', () => mock.emitStatus(1));
    await context.step('connect again', () =>
      context.driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' })
    );
    await context.step('status 2', () => mock.emitStatus(2));
  }
});

export default connectionScripts;
