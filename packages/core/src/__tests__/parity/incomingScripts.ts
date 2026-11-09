/* eslint-disable no-magic-numbers, no-restricted-globals */
// The scripts of the incoming parity spec: activities from Direct Line to the transcript (patches, voice), the reply hold
// (`sagas/queueIncomingActivitySaga.spec.ts`), suggested actions, and the fatal path.
import type { MockDirectLine, MockDirectLineInit } from './createMockDirectLine';
import type { Script, ScriptContext } from './runParityScript';

const DIRECT_LINE: MockDirectLineInit = Object.freeze({ name: 'dl1', replayStatus: true });

const BOT = Object.freeze({ id: 'bot', role: 'bot' });

function message(id: string, timestamp: number, extra: Record<string, unknown> = {}) {
  return { from: BOT, id, text: id, timestamp: new Date(timestamp).toISOString(), type: 'message', ...extra };
}

async function connectOnline(
  { createDirectLine, driver, step }: ScriptContext,
  init: MockDirectLineInit = DIRECT_LINE
): Promise<MockDirectLine> {
  const mock = createDirectLine(init);

  await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
  await step('online', () => mock.emitStatus(2));

  return mock;
}

const incomingScripts: Readonly<Record<string, Script>> = Object.freeze({
  'activities and patches': async context => {
    const mock = await connectOnline(context);

    await context.step('bot message', () => mock.emitActivity(message('1', 1_000)));
    await context.step('without from, null fields', () =>
      mock.emitActivity({
        attachments: null,
        channelData: null,
        id: '2',
        name: 'conversationUpdate',
        text: null,
        timestamp: new Date(2_000).toISOString(),
        type: 'conversationUpdate'
      })
    );
    await context.step('from the user ID, without role', () =>
      mock.emitActivity({
        from: { id: 'u-1' },
        id: '3',
        text: 'hi',
        timestamp: new Date(3_000).toISOString(),
        type: 'message'
      })
    );
    await context.step('from someone, without role; bot named as its ID', () => {
      mock.emitActivity({
        from: { id: 'x' },
        id: '4',
        text: 'x',
        timestamp: new Date(4_000).toISOString(),
        type: 'message'
      });
      mock.emitActivity({
        channelId: 'directline',
        from: { id: 'b', name: 'b', role: 'bot' },
        id: '5',
        text: 'b',
        timestamp: new Date(5_000).toISOString(),
        type: 'message'
      });
    });
    await context.step('from without ID', () =>
      mock.emitActivity({ from: {}, id: '6', text: 'c', timestamp: new Date(6_000).toISOString(), type: 'message' })
    );
    await context.step('same ID again (update)', () => mock.emitActivity(message('1', 1_000, { text: 'updated' })));
  },
  'activities before online are dropped': async ({ createDirectLine, driver, step }) => {
    const mock = createDirectLine(DIRECT_LINE);

    await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
    await step('activity while connecting', () => mock.emitActivity(message('0', 0)));
    await step('online', () => mock.emitStatus(2));
    await step('activity', () => mock.emitActivity(message('1', 1_000)));
  },
  'activities after disconnect are dropped': async context => {
    const mock = await connectOnline(context);

    await context.step('activity', () => mock.emitActivity(message('1', 1_000)));
    await context.step('disconnect', () => context.driver.disconnect());
    await context.step('activity after disconnect', () => mock.emitActivity(message('2', 2_000)));
  },
  'many activities in one turn': async context => {
    const mock = await connectOnline(context);

    await context.step('5 activities', () => {
      for (let index = 1; index <= 5; index++) {
        mock.emitActivity(message(`${index}`, index * 1_000, index === 3 ? { replyToId: '1' } : {}));
      }
    });
  },
  'voice activities are dropped when not recording': async context => {
    const mock = await connectOnline(context);

    await context.step('media.chunk', () =>
      mock.emitActivity({
        from: BOT,
        id: 'v1',
        name: 'media.chunk',
        timestamp: new Date(1_000).toISOString(),
        type: 'event',
        value: { content: 'AAAA' },
        valueType: 'azure.directline.audio.chunk'
      })
    );
    await context.step('request.update', () =>
      mock.emitActivity({
        from: BOT,
        id: 'v2',
        name: 'request.update',
        timestamp: new Date(2_000).toISOString(),
        type: 'event',
        value: { state: 'detected' },
        valueType: 'azure.directline.audio.state'
      })
    );
    await context.step('transcript', () =>
      mock.emitActivity({
        from: BOT,
        id: 'v3',
        name: 'media.end',
        timestamp: new Date(3_000).toISOString(),
        type: 'event',
        value: { origin: 'agent', transcription: 'Hello' },
        valueType: 'azure.directline.audio.transcript'
      })
    );
  },

  // sagas/queueIncomingActivitySaga.spec.ts
  'reply hold, timeout': async context => {
    const mock = await connectOnline(context);

    await context.step('bot activity', () => mock.emitActivity(message('1.0', 0)));
    await context.step('t=1000, reply to a missing activity', () => {
      context.clock.tick(1_000);
      mock.emitActivity(message('2.0', 1_000, { replyToId: '0.0' }));
    });
    await context.step('t=3000, another reply to it', () => {
      context.clock.tick(2_000);
      mock.emitActivity(message('2.1', 3_000, { replyToId: '0.0' }));
    });
    await context.step('t=6000, the first reply times out', () => context.clock.tick(3_000));
    await context.step('t=7000, a third reply', () => {
      context.clock.tick(1_000);
      mock.emitActivity(message('3.0', 7_000, { replyToId: '0.0' }));
    });
    await context.step('t=20000', () => context.clock.tick(13_000));
  },
  'reply hold, released by its target': async context => {
    const mock = await connectOnline(context);

    await context.step('bot activity', () => mock.emitActivity(message('1.0', 0)));
    await context.step('reply before its target', () => mock.emitActivity(message('3.0', 3_000, { replyToId: '2.0' })));
    await context.step('the target', () => mock.emitActivity(message('2.0', 2_000)));
    await context.step('t=10000', () => context.clock.tick(10_000));
  },
  'reply hold, not before the first bot activity': async context => {
    const mock = await connectOnline(context);

    await context.step('reply as the first activity', () =>
      mock.emitActivity(message('2.0', 2_000, { replyToId: '1.0' }))
    );
    await context.step('reply to a user activity', () => {
      mock.emitActivity({
        from: { id: 'u-1', role: 'user' },
        id: '3.0',
        text: 'q',
        timestamp: new Date(3_000).toISOString(),
        type: 'message'
      });
      mock.emitActivity(message('4.0', 4_000, { replyToId: '3.0' }));
    });
  },
  'reply hold, reconnect drops held activities': async context => {
    const mock = await connectOnline(context);

    await context.step('bot activity', () => mock.emitActivity(message('1.0', 0)));
    await context.step('reply to a missing activity', () =>
      mock.emitActivity(message('3.0', 3_000, { replyToId: '2.0' }))
    );
    await context.step('reconnecting', () => mock.emitStatus(1));
    await context.step('reconnected', () => mock.emitStatus(2));
    await context.step('the target', () => mock.emitActivity(message('2.0', 2_000)));
    await context.step('t=10000', () => context.clock.tick(10_000));
  },
  'reply hold, disconnect drops held activities': async context => {
    const mock = await connectOnline(context);

    await context.step('bot activity', () => mock.emitActivity(message('1.0', 0)));
    await context.step('reply to a missing activity', () =>
      mock.emitActivity(message('3.0', 3_000, { replyToId: '2.0' }))
    );
    await context.step('disconnect', () => context.driver.disconnect());
    await context.step('t=10000', () => context.clock.tick(10_000));
  },
  'activities and reconnect in one turn': async context => {
    const mock = await connectOnline(context);

    await context.step('activity, reconnecting, activity, reconnected, activity', () => {
      mock.emitActivity(message('1', 1_000));
      mock.emitStatus(1);
      mock.emitActivity(message('2', 2_000));
      mock.emitStatus(2);
      mock.emitActivity(message('3', 3_000));
    });
    await context.step('activity', () => mock.emitActivity(message('4', 4_000)));
  },

  // Suggested actions
  'suggested actions': async context => {
    const mock = await connectOnline(context);
    const actions = [{ title: 'A', type: 'imBack', value: 'a' }];

    await context.step('bot message with suggested actions', () =>
      mock.emitActivity(message('1', 1_000, { suggestedActions: { actions } }))
    );
    await context.step('bot event (not a message)', () =>
      mock.emitActivity({ from: BOT, id: '2', name: 'x', timestamp: new Date(2_000).toISOString(), type: 'event' })
    );
    await context.step('to someone else', () =>
      mock.emitActivity(message('3', 3_000, { suggestedActions: { actions, to: ['u-2'] } }))
    );
    await context.step('to the user', () =>
      mock.emitActivity(message('4', 4_000, { suggestedActions: { actions, to: ['u-2', 'u-1'] } }))
    );
    await context.step('from the user', () =>
      mock.emitActivity({
        from: { id: 'u-1', role: 'user' },
        id: '5',
        text: 'q',
        timestamp: new Date(5_000).toISOString(),
        type: 'message'
      })
    );
    await context.step('bot message without suggested actions', () => mock.emitActivity(message('6', 6_000)));
    await context.step('an older bot message with suggested actions', () =>
      mock.emitActivity(message('0', 500, { suggestedActions: { actions } }))
    );
  },

  // Fatal: an error in a saga stops all of them.
  'fatal: receiving an activity throws': async context => {
    context.faults.receiveThrowsFor = 'boom';

    const mock = await connectOnline(context);

    await context.step('activity', () => mock.emitActivity(message('1', 1_000)));
    await context.step('the activity that throws', () => mock.emitActivity(message('boom', 2_000)));
    await context.step('activity after', () => mock.emitActivity(message('3', 3_000)));
    await context.step('reconnecting', () => mock.emitStatus(1));
    await context.step('disconnect', () => context.driver.disconnect());
    await context.step('connect again', () =>
      context.driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' })
    );
  },
  'fatal: an activity that is not an object': async context => {
    const mock = await connectOnline(context);

    await context.step('activity', () => mock.emitActivity(message('1', 1_000)));
    await context.step('null', () => mock.emitActivity(null));
    await context.step('activity after', () => mock.emitActivity(message('2', 2_000)));
    await context.step('disconnect', () => context.driver.disconnect());
    await context.step('connect again', () =>
      context.driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' })
    );
    await context.step('online again', () => mock.emitStatus(2));
    await context.step('activity when online again', () => mock.emitActivity(message('3', 3_000)));
    await context.step('disconnect again', () => context.driver.disconnect());
  },
  'fatal: receiving a held activity throws on timeout': async context => {
    context.faults.receiveThrowsFor = 'boom';

    const mock = await connectOnline(context);

    await context.step('bot activity', () => mock.emitActivity(message('1', 1_000)));
    await context.step('reply to a missing activity', () =>
      mock.emitActivity(message('boom', 2_000, { replyToId: '0' }))
    );
    await context.step('t=5000', () => context.clock.tick(5_000));
  }
});

export default incomingScripts;
