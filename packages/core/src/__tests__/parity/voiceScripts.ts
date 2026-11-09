/* eslint-disable no-magic-numbers, no-restricted-globals */
// The scripts of the voice parity spec (speech-to-speech): the `voice` slice (recording, mute, state, handlers), the
// voice activities received (`observeActivitySaga`), and the voice activities posted (`postVoiceActivitySaga`).
import type { MockDirectLine, MockDirectLineInit } from './createMockDirectLine';
import type { Script, ScriptContext } from './runParityScript';

const DIRECT_LINE: MockDirectLineInit = Object.freeze({ name: 'dl1', replayStatus: true });

const BOT = Object.freeze({ id: 'bot', role: 'bot' });

async function connectOnline(
  { createDirectLine, driver, step }: ScriptContext,
  init: MockDirectLineInit = DIRECT_LINE
): Promise<MockDirectLine> {
  const mock = createDirectLine(init);

  await step('connect', () => driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' }));
  await step('online', () => mock.emitStatus(2));

  return mock;
}

function chunk(id: string, content: string | undefined) {
  return {
    from: BOT,
    id,
    name: 'media.chunk',
    timestamp: new Date(1_000).toISOString(),
    type: 'event',
    value: content === undefined ? {} : { content },
    valueType: 'azure.directline.audio.chunk'
  };
}

function update(id: string, state: string) {
  return {
    from: BOT,
    id,
    name: 'request.update',
    timestamp: new Date(2_000).toISOString(),
    type: 'event',
    value: { state },
    valueType: 'azure.directline.audio.state'
  };
}

function audioChunk(content: string) {
  return { name: 'media.chunk', type: 'event', value: { content, contentType: 'audio/webm', timestamp: 't' } };
}

const voiceScripts: Readonly<Record<string, Script>> = Object.freeze({
  'recording: start, mute, unmute, stop': async context => {
    const { ops } = context.driver;

    await context.step('start', () => ops.startVoice());
    await context.step('mute', () => ops.setMuted(true));
    await context.step('mute again', () => ops.setMuted(true));
    await context.step('unmute', () => ops.setMuted(false));
    await context.step('mute, stop: one change of both', () => {
      ops.setMuted(true);
      ops.stopVoice();
    });
    await context.step('stop again', () => ops.stopVoice());
  },
  'quirk: start when not idle warns, and starts; mute is reset by start and stop': async context => {
    const { ops } = context.driver;

    await context.step('start', () => ops.startVoice());
    await context.step('mute, start again', () => {
      ops.setMuted(true);
      ops.startVoice();
    });
    await context.step('processing, start', () => {
      ops.setVoiceState('processing');
      ops.startVoice();
    });
    await context.step('set state idle, mute while idle', () => {
      ops.setVoiceState('idle');
      ops.setMuted(true);
    });
    await context.step('set state as is', () => ops.setVoiceState('idle'));
    await context.step('start while muted and idle', () => ops.startVoice());
  },
  'quirk: every register and unregister makes new handlers': async context => {
    const { ops } = context.driver;
    const h1 = context.createVoiceHandler('h1');
    const h2 = context.createVoiceHandler('h2');
    let unregister1: () => void;
    let unregister2: () => void;

    await context.step('register h1', () => {
      unregister1 = ops.registerVoiceHandler(h1);
    });
    await context.step('register h2', () => {
      unregister2 = ops.registerVoiceHandler(h2);
    });
    await context.step('register h1 again', () => ops.registerVoiceHandler(h1));
    await context.step('unregister the first h1', () => unregister1());
    await context.step('unregister it again', () => unregister1());
    await context.step('unregister h2', () => unregister2());
  },
  'voice activities: idle, listening, detected, processing': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('register h1, h2', () => {
      ops.registerVoiceHandler(context.createVoiceHandler('h1'));
      ops.registerVoiceHandler(context.createVoiceHandler('h2'));
    });
    await context.step('chunk while idle', () => mock.emitActivity(chunk('v1', 'AAAA')));
    await context.step('detected while idle', () => mock.emitActivity(update('v2', 'detected')));
    await context.step('start', () => ops.startVoice());
    await context.step('chunk', () => mock.emitActivity(chunk('v3', 'BBBB')));
    await context.step('chunk without content', () => mock.emitActivity(chunk('v4', undefined)));
    await context.step('chunk, empty content', () => mock.emitActivity(chunk('v5', '')));
    await context.step('detected: audio stops, then user speaking', () => mock.emitActivity(update('v6', 'detected')));
    await context.step('processing', () => mock.emitActivity(update('v7', 'processing')));
    await context.step('another state', () => mock.emitActivity(update('v8', 'other')));
    await context.step('another name', () => mock.emitActivity({ ...chunk('v9', 'CCCC'), name: 'media.other' }));
    await context.step('a transcript is an activity', () =>
      mock.emitActivity({
        from: BOT,
        id: 'v10',
        name: 'media.end',
        timestamp: new Date(3_000).toISOString(),
        type: 'event',
        value: { origin: 'agent', transcription: 'Hello' },
        valueType: 'azure.directline.audio.transcript'
      })
    );
    await context.step('stop', () => ops.stopVoice());
    await context.step('chunk after stop', () => mock.emitActivity(chunk('v11', 'DDDD')));
  },
  'voice activities: a chunk and an update in one turn, with a message': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('register h1, start', () => {
      ops.registerVoiceHandler(context.createVoiceHandler('h1'));
      ops.startVoice();
    });
    await context.step('chunk, message, detected, chunk', () => {
      mock.emitActivity(chunk('v1', 'AAAA'));
      mock.emitActivity({
        from: BOT,
        id: 'm1',
        text: 'm1',
        timestamp: new Date(1_500).toISOString(),
        type: 'message'
      });
      mock.emitActivity(update('v2', 'detected'));
      mock.emitActivity(chunk('v3', 'BBBB'));
    });
  },
  'voice activities while reconnecting are dropped': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('register h1, start', () => {
      ops.registerVoiceHandler(context.createVoiceHandler('h1'));
      ops.startVoice();
    });
    await context.step('reconnecting', () => mock.emitStatus(1));
    await context.step('chunk', () => mock.emitActivity(chunk('v1', 'AAAA')));
    await context.step('reconnected', () => mock.emitStatus(2));
    await context.step('chunk after', () => mock.emitActivity(chunk('v2', 'BBBB')));
  },

  // Posting.
  'voice post: the fields, fire and forget': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('locale', () => ops.setLanguage('fr-FR'));
    await context.step('chunk', () => ops.postVoiceActivity(audioChunk('AAAA')));
    await context.step('returns', () => mock.post(1).next());
    await context.step('a message, with an ID and from', () =>
      ops.postVoiceActivity({ from: { id: 'x', role: 'bot' }, id: 'm1', text: 'hi', type: 'message' })
    );
    await context.step('completes', () => mock.post(2).complete());
    await context.step('an event without value', () => ops.postVoiceActivity({ name: 'e', type: 'event' }));
    await context.step('returns twice', () => {
      mock.post(3).next();
      mock.post(3).next();
    });
  },
  'voice post: an error is logged': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('chunk', () => ops.postVoiceActivity(audioChunk('AAAA')));
    await context.step('error', () => mock.post(1).error(new Error('boom')));
  },
  'voice post: postActivity() throws': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('throws', () => {
      mock.setPostThrows(true);
      ops.postVoiceActivity(audioChunk('AAAA'));
    });
    await context.step('post after', () => {
      mock.setPostThrows(false);
      ops.postVoiceActivity(audioChunk('BBBB'));
    });
  },
  'voice post: returns when subscribed': async context => {
    await connectOnline(context, { ...DIRECT_LINE, postReturnsOnSubscribe: true });

    await context.step('chunk', () => context.driver.ops.postVoiceActivity(audioChunk('AAAA')));
    await context.step('chunk again', () => context.driver.ops.postVoiceActivity(audioChunk('BBBB')));
  },
  'quirk: voice posts offline are dropped; in flight, unsubscribed silently': async context => {
    const { ops } = context.driver;

    await context.step('before connect', () => ops.postVoiceActivity(audioChunk('AAAA')));

    const mock = await connectOnline(context);

    await context.step('2 in flight', () => {
      ops.postVoiceActivity(audioChunk('BBBB'));
      ops.postVoiceActivity(audioChunk('CCCC'));
    });
    await context.step('one returns', () => mock.post(1).next());
    await context.step('reconnecting', () => mock.emitStatus(1));
    await context.step('while reconnecting', () => ops.postVoiceActivity(audioChunk('DDDD')));
    await context.step('the other errors after', () => mock.post(2).error(new Error('late')));
    await context.step('reconnected', () => mock.emitStatus(2));
    await context.step('posted', () => ops.postVoiceActivity(audioChunk('EEEE')));
    await context.step('disconnect', () => context.driver.disconnect());
    await context.step('after disconnect', () => ops.postVoiceActivity(audioChunk('FFFF')));
  },
  'quirk: a voice post is not the first post': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('voice post', () => ops.postVoiceActivity(audioChunk('AAAA')));
    await context.step('a message', () => ops.sendMessage('hello'));
    await context.step('another voice post', () => ops.postVoiceActivity(audioChunk('BBBB')));
    await context.step('all return', () => {
      for (let n = 1; n <= mock.postCount(); n++) {
        mock.post(n).next();
      }

      mock.post(2).echo();
    });
  },
  'voice post and a message post in flight, going offline': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('message, voice, message', () => {
      ops.sendMessage('one');
      ops.postVoiceActivity(audioChunk('AAAA'));
      ops.sendMessage('two');
    });
    await context.step('disconnect', () => context.driver.disconnect());
    await context.step('late return', () => mock.post(2).next());
  }
});

export default voiceScripts;
