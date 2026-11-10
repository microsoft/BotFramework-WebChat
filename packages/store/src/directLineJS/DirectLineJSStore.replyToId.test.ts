import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import createDirectLineJSStore from './createDirectLineJSStore.ts';
import type DirectLineJSStore from './DirectLineJSStore.ts';
import createMockDirectLine from './private/test/createMockDirectLine.ts';

type Timer = { readonly handler: () => void; readonly time: number };

function createFakeTimers() {
  const timers = new Map<number, Timer>();

  let now = 0;
  let nextHandle = 1;

  const ponyfill = Object.freeze({
    clearTimeout: (handle: ReturnType<typeof setTimeout>) => {
      typeof handle === 'number' && timers.delete(handle);
    },
    setTimeout: (handler: () => void, timeout: number): ReturnType<typeof setTimeout> => {
      const handle = nextHandle++;

      timers.set(handle, Object.freeze({ handler, time: now + timeout }));

      // Fake handle, Node.js `setTimeout` returns an object while browser returns a number.
      return handle as unknown as ReturnType<typeof setTimeout>;
    }
  });

  const tick = (ms: number) => {
    now += ms;

    for (const [handle, { handler, time }] of timers) {
      if (time <= now) {
        timers.delete(handle);
        handler();
      }
    }
  };

  return Object.freeze({ numPending: () => timers.size, ponyfill, tick });
}

function createStore() {
  const { directLine, emitActivity } = createMockDirectLine();
  const timers = createFakeTimers();
  const store = createDirectLineJSStore({ directLine, ponyfill: timers.ponyfill });

  // eslint-disable-next-line no-console
  const originalWarn = console.warn;
  const warnings: unknown[][] = [];

  // eslint-disable-next-line no-console
  console.warn = (...args: unknown[]) => warnings.push(args);

  const restore = () => {
    // eslint-disable-next-line no-console
    console.warn = originalWarn;
  };

  return Object.freeze({ emitActivity, restore, store, timers, warnings });
}

function getSortedTexts(store: DirectLineJSStore): readonly (string | undefined)[] {
  return Array.from(store.getSortedParts(store.conversationId, { by: 'dateCreated' })).map(
    ({ text }) => text?.[0] as string | undefined
  );
}

const botActivity = (id: string, timestamp: number, replyToId?: string | undefined) =>
  Object.freeze({
    from: { id: 'bot', role: 'bot' },
    id,
    ...(replyToId ? { replyToId } : {}),
    text: id,
    timestamp: new Date(timestamp).toISOString(),
    type: 'message'
  });

scenario(
  'replying to an activity which has not arrived yet',
  bdd => {
    bdd
      .given(
        'a Direct Line store with an activity from the bot',
        () => {
          const given = createStore();

          given.emitActivity(botActivity('a-00001', 1_000));

          return given;
        },
        ({ restore }) => restore()
      )
      .when('an activity replying to a missing activity is received', ({ emitActivity, store }) => {
        emitActivity(botActivity('a-00003', 3_000, 'a-00002'));

        return store;
      })
      .then('should hold the activity', (_, store) => {
        expect(getSortedTexts(store)).toEqual(['a-00001']);
      })
      .and('should set a timer of 5 seconds', ({ timers }) => {
        expect(timers.numPending()).toBe(1);
      })
      .when('the missing activity arrived', ({ emitActivity, store }) => {
        emitActivity(botActivity('a-00002', 2_000));

        return store;
      })
      .then('should release the held activity', (_, store) => {
        expect(getSortedTexts(store)).toEqual(['a-00001', 'a-00002', 'a-00003']);
      })
      .and('should clear the timer', ({ timers }) => {
        expect(timers.numPending()).toBe(0);
      })
      .and('should not warn', ({ warnings }) => {
        expect(warnings).toHaveLength(0);
      });
  },
  NodeTest
);

scenario(
  'replying to an activity which never arrive',
  bdd => {
    bdd
      .given(
        'a Direct Line store with an activity from the bot',
        () => {
          const given = createStore();

          given.emitActivity(botActivity('a-00001', 1_000));

          return given;
        },
        ({ restore }) => restore()
      )
      .when('an activity replying to a missing activity is received', ({ emitActivity, store }) => {
        emitActivity(botActivity('a-00003', 3_000, 'a-00002'));

        return store;
      })
      .then('should hold the activity', (_, store) => {
        expect(getSortedTexts(store)).toEqual(['a-00001']);
      })
      .when('4.999 seconds passed', ({ store, timers }) => {
        timers.tick(4_999);

        return store;
      })
      .then('should still hold the activity', (_, store) => {
        expect(getSortedTexts(store)).toEqual(['a-00001']);
      })
      .when('another millisecond passed', ({ store, timers }) => {
        timers.tick(1);

        return store;
      })
      .then('should release the held activity', (_, store) => {
        expect(getSortedTexts(store)).toEqual(['a-00001', 'a-00003']);
      })
      .and('should warn', ({ warnings }) => {
        expect(warnings).toHaveLength(1);
      });
  },
  NodeTest
);

scenario(
  'multiple activities replying to the same missing activity',
  bdd => {
    bdd
      .given(
        'a Direct Line store with an activity from the bot',
        () => {
          const given = createStore();

          given.emitActivity(botActivity('a-00001', 1_000));

          return given;
        },
        ({ restore }) => restore()
      )
      .when('2 activities replying to a missing activity are received', ({ emitActivity, store }) => {
        emitActivity(botActivity('a-00003', 3_000, 'a-00002'));
        emitActivity(botActivity('a-00004', 4_000, 'a-00002'));

        return store;
      })
      .then('should hold both activities', (_, store) => {
        expect(getSortedTexts(store)).toEqual(['a-00001']);
      })
      .when('timed out', ({ store, timers }) => {
        timers.tick(5_000);

        return store;
      })
      .then('should release both activities', (_, store) => {
        expect(getSortedTexts(store)).toEqual(['a-00001', 'a-00003', 'a-00004']);
      })
      .and('should clear all timers', ({ timers }) => {
        expect(timers.numPending()).toBe(0);
      })
      .when('another activity replying to the same missing activity is received', ({ emitActivity, store }) => {
        emitActivity(botActivity('a-00005', 5_000, 'a-00002'));

        return store;
      })
      .then('should not hold the activity', (_, store) => {
        expect(getSortedTexts(store)).toEqual(['a-00001', 'a-00003', 'a-00004', 'a-00005']);
      });
  },
  NodeTest
);

scenario(
  'replying to a missing activity as the first activity from the bot',
  bdd => {
    bdd
      .given(
        'a Direct Line store',
        () => createStore(),
        ({ restore }) => restore()
      )
      .when('the first activity from the bot is replying to a missing activity', ({ emitActivity, store }) => {
        emitActivity(botActivity('a-00002', 2_000, 'a-00001'));

        return store;
      })
      .then('should not hold the activity', (_, store) => {
        expect(getSortedTexts(store)).toEqual(['a-00002']);
      })
      .and('should not set any timer', ({ timers }) => {
        expect(timers.numPending()).toBe(0);
      });
  },
  NodeTest
);

scenario(
  'deleting a held activity',
  bdd => {
    bdd
      .given(
        'a Direct Line store with a held activity',
        () => {
          const given = createStore();

          given.emitActivity(botActivity('a-00001', 1_000));
          given.emitActivity(botActivity('a-00003', 3_000, 'a-00002'));

          return given;
        },
        ({ restore }) => restore()
      )
      .when('the held activity is deleted', ({ emitActivity, store }) => {
        emitActivity({ from: { id: 'bot', role: 'bot' }, id: 'a-00003', type: 'messageDelete' });

        return store;
      })
      .then('should clear the timer', ({ timers }) => {
        expect(timers.numPending()).toBe(0);
      })
      .when('the missing activity arrived', ({ emitActivity, store }) => {
        emitActivity(botActivity('a-00002', 2_000));

        return store;
      })
      .then('should not release the deleted activity', (_, store) => {
        expect(getSortedTexts(store)).toEqual(['a-00001', 'a-00002']);
      });
  },
  NodeTest
);
