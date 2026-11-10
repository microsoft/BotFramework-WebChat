/**
 * @jest-environment @happy-dom/jest-environment
 */
// Redux mode on the machines against the sagas, on random scripts: seeded sequences of what a host, a user, a bot and
// Direct Line do (connection statuses, sends, the send box, speech, bot replies, post results, time), each run on both
// engines and recorded as for the goldens. The fixed scripts pin known cases; these look for orders nobody wrote down.
import type { Middleware } from 'redux';

import createReduxDriver, { createMachinesDriver } from './createReduxDriver';
import encodeGolden from './encodeGolden';
import runParityScript, { type Script } from './runParityScript';

const SCRIPTS = 60;
const STEPS = 30;

// mulberry32: small, seeded, the same sequence on every run.
function createRandom(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;

    let value = Math.imul(state ^ (state >>> 15), 1 | state);

    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const HOSTS: readonly (readonly [string, Middleware | undefined])[] = Object.freeze([
  ['no host middleware', undefined],
  ['a host that clones every action', () => next => (action: any) => next({ ...action })],
  [
    'a host that passes POST_ACTIVITY on after a microtask',
    () => next => (action: any) =>
      action.type === 'DIRECT_LINE/POST_ACTIVITY' ? queueMicrotask(() => next(action)) : next(action)
  ]
]);

function createScript(seed: number): Script {
  return async ({ clock, createDirectLine, driver, step }) => {
    const random = createRandom(seed);
    const pick = <T>(values: readonly T[]): T => values[Math.floor(random() * values.length)];
    const { ops } = driver;
    let mock = createDirectLine({ name: 'dl1', replayStatus: true });
    let botIDs = 0;
    let connected = false;

    const tryTo = (fn: () => void) => () => {
      try {
        fn();
      } catch (error) {
        console.warn(`threw: ${error instanceof Error ? error.message : error}`);
      }
    };

    const actions: readonly (readonly [string, () => void])[] = [
      ['status 1', () => connected && mock.emitStatus(1)],
      ['status 2', () => connected && mock.emitStatus(2)],
      ['status 2 again', () => connected && mock.emitStatus(2)],
      ['status 4', () => connected && mock.emitStatus(4)],
      [
        'disconnect or connect',
        () => {
          if (connected) {
            driver.disconnect();
          } else {
            mock = createDirectLine({ name: `dl${seed}-${botIDs}`, replayStatus: true });
            driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' });
          }

          connected = !connected;
        }
      ],
      ['send a message', () => ops.sendMessage(`m${botIDs}`, pick(['keyboard', 'speech']))],
      ['send an event', () => ops.sendEvent('e', botIDs)],
      ['set the send box', () => ops.setSendBox(pick(['', 'typing', 'typing']))],
      ['submit', () => ops.submitSendBox()],
      ['typing indicator', () => ops.setSendTypingIndicator(pick([false, true]))],
      ['dictate state', () => ops.setDictateState(pick([0, 1, 2, 3, 4]))],
      ['interims', () => ops.setDictateInterims(['x'])],
      ['start speaking', () => ops.startSpeakingActivity()],
      ['stop speaking', () => ops.stopSpeakingActivity()],
      [
        'bot message',
        () => {
          const id = `b${++botIDs}`;

          mock.emitActivity({
            from: { id: 'bot', role: 'bot' },
            id,
            inputHint: pick(['acceptingInput', 'expectingInput', 'ignoringInput', undefined]),
            replyToId: pick([undefined, undefined, `b${botIDs - 1}`, 'missing']),
            speak: pick([undefined, 'hi']),
            suggestedActions: pick([undefined, { actions: [{ title: 'A', type: 'imBack', value: 'a' }] }]),
            text: id,
            // The time of the activity, not of the clock.
            // eslint-disable-next-line no-restricted-globals
            timestamp: new Date(botIDs * 1000).toISOString(),
            type: 'message'
          });
        }
      ],
      ['a post returns', () => mock.postCount() && mock.post(Math.ceil(random() * mock.postCount())).next()],
      ['a post echoes', () => mock.postCount() && mock.post(Math.ceil(random() * mock.postCount())).echo()],
      ['time passes', () => clock.tick(pick([100, 3000, 15000, 20000, 300000]))]
    ];

    await step('connect', () => {
      driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' });
      connected = true;
    });
    await step('online', () => mock.emitStatus(2));

    for (let index = 0; index < STEPS; index++) {
      const [label, fn] = pick(actions);

      // eslint-disable-next-line no-await-in-loop
      await step(`${index}: ${label}`, tryTo(fn));
    }
  };
}

test.each(Array.from({ length: SCRIPTS }, (_, index) => index + 1))('random script %i', async seed => {
  const [, middleware] = HOSTS[seed % HOSTS.length];
  const script = createScript(seed);
  const host = middleware && { middleware };
  const sagas = encodeGolden(await runParityScript(createReduxDriver, script, { golden: true, host }));
  const machines = encodeGolden(await runParityScript(createMachinesDriver, script, { golden: true, host }));

  expect(machines).toStrictEqual(sagas);
});
