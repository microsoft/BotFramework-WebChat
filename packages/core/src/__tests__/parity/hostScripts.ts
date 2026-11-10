/* eslint-disable no-magic-numbers, no-restricted-globals */
// The scripts of a host in Redux mode: what the middleware and the store listeners of a host do to the actions of Web
// Chat, as the samples and the html2 pages with a store do. Each script has the host it runs with: its middleware sits
// between the recorder (outermost) and the sagas, its listener after the recorder's.
import { CONNECT_FULFILLED } from '../../actions/connect';
import incomingActivity, { INCOMING_ACTIVITY } from '../../actions/incomingActivity';
import { POST_ACTIVITY, POST_ACTIVITY_PENDING } from '../../actions/postActivity';
import queueIncomingActivity from '../../actions/queueIncomingActivity';
import sendEvent from '../../actions/sendEvent';
import sendMessage from '../../actions/sendMessage';
import setSendBox, { SET_SEND_BOX } from '../../actions/setSendBox';
import { SET_SUGGESTED_ACTIONS } from '../../actions/setSuggestedActions';
import type { MockDirectLine } from './createMockDirectLine';
import type { Host, Script, ScriptContext } from './runParityScript';

type HostScript = { readonly host: Host; readonly script: Script };

const BOT = Object.freeze({ id: 'bot', role: 'bot' });
const ACTIONS = Object.freeze([Object.freeze({ title: 'A', type: 'imBack', value: 'a' })]);

// `any`: what a bot sends, not yet a `WebChatActivity`.
function botMessage(id: string, timestamp: number, extra: Record<string, unknown> = {}): any {
  return { from: BOT, id, text: id, timestamp: new Date(timestamp).toISOString(), type: 'message', ...extra };
}

async function connectOnline({ createDirectLine, driver, step }: ScriptContext): Promise<MockDirectLine> {
  const mock = createDirectLine({ name: 'dl1', replayStatus: true });

  await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
  await step('online', () => mock.emitStatus(2));

  return mock;
}

/** Every post so far returns and echoes, in order. */
function sendAll(mock: MockDirectLine, from = 1): void {
  for (let n = from; n <= mock.postCount(); n++) {
    mock.post(n).next();
    mock.post(n).echo();
  }
}

/** Runs `fn`; an error thrown is logged as a warning, so the records show it. */
function logThrow(fn: () => void): void {
  try {
    fn();
  } catch (error) {
    console.warn(`threw: ${error instanceof Error ? error.message : error}`);
  }
}

const hostScripts: Readonly<Record<string, HostScript>> = Object.freeze({
  // A new action for every POST_ACTIVITY, with more channel data, as the "piggyback" samples do.
  'middleware: piggyback channel data on POST_ACTIVITY': {
    host: {
      middleware: () => next => (action: any) =>
        next(
          action.type === POST_ACTIVITY
            ? {
                ...action,
                payload: {
                  ...action.payload,
                  activity: {
                    ...action.payload.activity,
                    channelData: { ...action.payload.activity.channelData, email: 'user@example.com' }
                  }
                }
              }
            : action
        )
    },
    script: async context => {
      const mock = await connectOnline(context);
      const { ops } = context.driver;

      await context.step('send a message (the sagas put POST_ACTIVITY)', () => ops.sendMessage('hello'));
      await context.step('post an activity (POST_ACTIVITY from the host)', () =>
        ops.postActivity({ channelData: { a: 1 }, text: 'posted', type: 'message' })
      );
      await context.step('typing', () => {
        ops.setSendTypingIndicator(true);
        ops.setSendBox('h');
      });
      await context.step('all return and echo', () => sendAll(mock));
    }
  },

  // Activities that never reach the reducers nor the sagas: an event, a message with suggested actions, the echo.
  'middleware: swallow INCOMING_ACTIVITY': {
    host: {
      middleware: () => next => (action: any) =>
        action.type === INCOMING_ACTIVITY &&
        (action.payload.activity.type === 'event' || action.payload.activity.channelData?.hidden)
          ? undefined
          : next(action)
    },
    script: async context => {
      const mock = await connectOnline(context);
      const { ops } = context.driver;

      await context.step('speak the next activity', () => ops.startSpeakingActivity());
      await context.step('bot event (swallowed)', () =>
        mock.emitActivity({ from: BOT, id: 'e1', name: 'x', timestamp: new Date(1_000).toISOString(), type: 'event' })
      );
      await context.step('bot message with suggested actions (swallowed)', () =>
        mock.emitActivity(
          botMessage('b1', 2_000, { channelData: { hidden: true }, suggestedActions: { actions: ACTIONS } })
        )
      );
      await context.step('reply to the swallowed message', () =>
        mock.emitActivity(botMessage('b2', 3_000, { replyToId: 'b1' }))
      );
      await context.step('send a message', () =>
        ops.sendMessage('hidden', 'keyboard', { channelData: { hidden: true } })
      );
      await context.step('it returns, the echo is swallowed', () => {
        mock.post(1).next();
        mock.post(1).echo();
      });
      await context.step('t=300000', () => context.clock.tick(300_000));
    }
  },

  // The welcome event of the samples: SEND_EVENT dispatched inside the dispatch of CONNECT_FULFILLED (a put).
  'middleware: welcome SEND_EVENT on CONNECT_FULFILLED': {
    host: {
      middleware:
        ({ dispatch }) =>
        next =>
        (action: any) => {
          const result = next(action);

          action.type === CONNECT_FULFILLED && dispatch(sendEvent('webchat/join', { language: 'en-US' }));

          return result;
        }
    },
    script: async context => {
      const mock = await connectOnline(context);

      await context.step('the event returns and echoes', () => sendAll(mock));
      await context.step('reconnecting', () => mock.emitStatus(1));
      await context.step('reconnected (no second welcome)', () => mock.emitStatus(2));
      await context.step('disconnect', () => context.driver.disconnect());
    }
  },

  // A copy of every action: the copies of the actions put by the sagas are not marked as such.
  'middleware: clone every action': {
    host: { middleware: () => next => (action: any) => next({ ...action }) },
    script: async context => {
      const mock = await connectOnline(context);
      const { ops } = context.driver;

      await context.step('speak the next activity', () => ops.startSpeakingActivity());
      await context.step('bot message with suggested actions', () =>
        mock.emitActivity(botMessage('b1', 1_000, { suggestedActions: { actions: ACTIONS } }))
      );
      await context.step('reply held, then its target', () => {
        mock.emitActivity(botMessage('b3', 3_000, { replyToId: 'b2' }));
        mock.emitActivity(botMessage('b2', 2_000));
      });
      await context.step('type and submit', () => {
        ops.setSendTypingIndicator(true);
        ops.setSendBox('hello');
        ops.submitSendBox();
      });
      await context.step('all return and echo', () => sendAll(mock));
      await context.step('reconnecting', () => mock.emitStatus(1));
      await context.step('reconnected', () => mock.emitStatus(2));
      await context.step('disconnect', () => context.driver.disconnect());
    }
  },

  // A dispatch before passing a put on (SET_SEND_BOX before INCOMING_ACTIVITY), and one after (SEND_MESSAGE).
  'middleware: dispatch inside a put, before and after next()': {
    host: {
      middleware:
        ({ dispatch }) =>
        next =>
        (action: any) => {
          const isPing = action.type === INCOMING_ACTIVITY && action.payload.activity.text === 'ping';

          isPing && dispatch(setSendBox('pong'));

          const result = next(action);

          isPing && dispatch(sendMessage('ack', 'keyboard'));

          return result;
        }
    },
    script: async context => {
      const mock = await connectOnline(context);

      await context.step('bot "ping"', () => mock.emitActivity(botMessage('b1', 1_000, { text: 'ping' })));
      await context.step('all return and echo', () => sendAll(mock));
      await context.step('bot "ping" with a reply held', () => {
        mock.emitActivity(botMessage('b3', 3_000, { replyToId: 'b2' }));
        mock.emitActivity(botMessage('b2', 2_000, { text: 'ping' }));
      });
      await context.step('all return and echo again', () => sendAll(mock, 2));
    }
  },

  // Throwing on an action from outside (SET_SEND_BOX "boom"): the dispatch throws to the caller.
  'middleware: throws on an external action': {
    host: {
      middleware: () => next => (action: any) => {
        if (action.type === SET_SEND_BOX && action.payload.text === 'boom') {
          throw new Error('host throws on SET_SEND_BOX');
        }

        return next(action);
      }
    },
    script: async context => {
      const mock = await connectOnline(context);
      const { ops } = context.driver;

      await context.step('typing on, speak the next activity', () => {
        ops.setSendTypingIndicator(true);
        ops.startSpeakingActivity();
      });
      await context.step('set the send box to "boom"', () => logThrow(() => ops.setSendBox('boom')));
      await context.step('set the send box to "ok"', () => ops.setSendBox('ok'));
      await context.step('all return and echo', () => sendAll(mock));
      await context.step('bot message', () => mock.emitActivity(botMessage('b1', 1_000)));
    }
  },

  // Throwing on an action put by a saga (SET_SUGGESTED_ACTIONS): a saga error.
  'middleware: throws on a put': {
    host: {
      middleware: () => next => (action: any) => {
        if (action.type === SET_SUGGESTED_ACTIONS && action.payload.suggestedActions.length) {
          throw new Error('host throws on SET_SUGGESTED_ACTIONS');
        }

        return next(action);
      }
    },
    script: async context => {
      const mock = await connectOnline(context);
      const { ops } = context.driver;

      await context.step('bot message', () => mock.emitActivity(botMessage('b1', 1_000)));
      await context.step('bot message with suggested actions', () =>
        mock.emitActivity(botMessage('b2', 2_000, { suggestedActions: { actions: ACTIONS } }))
      );
      await context.step('bot message after', () => mock.emitActivity(botMessage('b3', 3_000)));
      await context.step('send a message', () => ops.sendMessage('after'));
      await context.step('disconnect', () => context.driver.disconnect());
    }
  },

  // Activities that the host dispatches itself, as the html2 pages and some samples do.
  'dispatch: QUEUE_INCOMING_ACTIVITY and INCOMING_ACTIVITY from the host': {
    host: {},
    script: async context => {
      const { rawDispatch } = context.driver;

      await context.step('before connect', () => {
        rawDispatch(queueIncomingActivity(botMessage('q0', 0)));
        rawDispatch(incomingActivity(botMessage('i0', 500)));
      });

      const mock = await connectOnline(context);

      await context.step('speak the next activity', () => context.driver.ops.startSpeakingActivity());
      await context.step('QUEUE_INCOMING_ACTIVITY', () =>
        rawDispatch(queueIncomingActivity(botMessage('q1', 1_000, { suggestedActions: { actions: ACTIONS } })))
      );
      await context.step('QUEUE_INCOMING_ACTIVITY, a reply held', () =>
        rawDispatch(queueIncomingActivity(botMessage('q3', 3_000, { replyToId: 'i2' })))
      );
      await context.step('INCOMING_ACTIVITY, the target of the reply', () =>
        rawDispatch(incomingActivity(botMessage('i2', 2_000, { suggestedActions: { actions: ACTIONS } })))
      );
      await context.step('send a message', () => context.driver.ops.sendMessage('hello'));
      await context.step('INCOMING_ACTIVITY, the echo of the message', () =>
        rawDispatch(
          incomingActivity({
            ...mock.post(1).activity,
            id: 'echo-1',
            timestamp: new Date(4_000).toISOString()
          })
        )
      );
      await context.step('the post returns', () => mock.post(1).next());
      await context.step('disconnect', () => context.driver.disconnect());
      await context.step('QUEUE_INCOMING_ACTIVITY after disconnect', () =>
        rawDispatch(queueIncomingActivity(botMessage('q5', 5_000)))
      );
    }
  },

  // A listener of the store that throws when the send box becomes "boom" (an action from outside).
  'listener: throws on an external action': {
    host: {
      listener: getState => {
        if (getState().sendBoxValue === 'boom') {
          throw new Error('listener on "boom"');
        }
      }
    },
    script: async context => {
      const mock = await connectOnline(context);
      const { ops } = context.driver;

      await context.step('typing on, speak the next activity', () => {
        ops.setSendTypingIndicator(true);
        ops.startSpeakingActivity();
      });
      await context.step('set the send box to "boom"', () => logThrow(() => ops.setSendBox('boom')));
      await context.step('set the send box to "ok"', () => ops.setSendBox('ok'));
      await context.step('all return and echo', () => sendAll(mock));
    }
  },

  // A listener of the store that throws on the first state with a pending post (POST_ACTIVITY_PENDING, a put).
  'listener: throws on a put': {
    host: {
      listener: (() => {
        // Once per store (`getState` is the store's).
        const thrown = new WeakSet<() => any>();

        return (getState: () => any) => {
          if (!thrown.has(getState) && getState().activities.some(({ text }) => text === 'boom')) {
            thrown.add(getState);

            throw new Error(`listener on ${POST_ACTIVITY_PENDING}`);
          }
        };
      })()
    },
    script: async context => {
      const mock = await connectOnline(context);
      const { ops } = context.driver;

      await context.step('send "boom"', () => ops.sendMessage('boom'));
      await context.step('send "after"', () => ops.sendMessage('after'));
      await context.step('bot message', () => mock.emitActivity(botMessage('b1', 1_000)));
      await context.step('disconnect', () => context.driver.disconnect());
    }
  }
});

export default hostScripts;

export type { HostScript };
