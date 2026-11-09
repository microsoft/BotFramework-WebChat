/* eslint-disable no-magic-numbers, no-restricted-globals */
// The scripts of the send box parity spec: the senders (`send*ToPostActivitySaga`), clearing the suggested actions on a
// message, marking an activity, the send box (`submitSendBoxSaga`), the typing indicator
// (`sendTypingIndicatorOnSetSendBoxSaga`, `emitTypingIndicatorToPostActivitySaga`), and the actions that card action
// middleware can dispatch (`dispatch()` of the store in Redux mode).
import type { MockDirectLine, MockDirectLineInit } from './createMockDirectLine';
import type { Script, ScriptContext } from './runParityScript';

const DIRECT_LINE: MockDirectLineInit = Object.freeze({ name: 'dl1', replayStatus: true });

const BOT = Object.freeze({ id: 'bot', role: 'bot' });
const ACTIONS = Object.freeze([Object.freeze({ title: 'A', type: 'imBack', value: 'a' })]);

function botMessage(id: string, timestamp: number, extra: Record<string, unknown> = {}) {
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

// Created once: the same objects in every run (`lastModified` is the time of creation).
const PNG_FILE = new File([new Uint8Array([1, 2, 3])], 'a.png', { type: 'image/png' });
const PNG = () => PNG_FILE;
const BLOB = () => new Blob([new Uint8Array([1, 2, 3, 4])]);

const sendScripts: Readonly<Record<string, Script>> = Object.freeze({
  // Senders.
  'sendMessage: text, method, channelData, replyToId': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('text', () => ops.sendMessage('hello'));
    await context.step('method, channelData, replyToId', () =>
      ops.sendMessage('speak', 'speech', { channelData: { a: 1 }, replyToId: 'r1' })
    );
    await context.step('empty replyToId', () => ops.sendMessage('x', 'keyboard', { replyToId: '' }));
    await context.step('whitespace text', () => ops.sendMessage('  '));
    await context.step('all return and echo', () => sendAll(mock));
  },
  'sendMessage: nothing to send': async context => {
    await connectOnline(context);
    const { ops } = context.driver;

    await context.step('empty text', () => ops.sendMessage(''));
    await context.step('no text', () => ops.sendMessage(undefined));
    await context.step('no text, empty attachments', () => ops.sendMessage(undefined, 'keyboard', { attachments: [] }));
    await context.step('invalid text', () => logThrow(() => ops.sendMessage(1 as any)));
  },
  'sendMessage: attachments': async context => {
    const mock = await connectOnline(context);

    await context.step('a file and a blob', () =>
      context.driver.ops.sendMessage(undefined, 'keyboard', {
        attachments: [{ blob: PNG(), thumbnailURL: new URL('https://example.com/t.png') }, { blob: BLOB() }],
        channelData: { a: 1 }
      })
    );
    await context.step('text and a file', () =>
      context.driver.ops.sendMessage('with file', 'keyboard', { attachments: [{ blob: PNG() }] })
    );
    await context.step('all return and echo', () => sendAll(mock));
  },
  'sendMessageBack, sendPostBack': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('messageBack', () => ops.sendMessageBack({ v: 1 }, 'text', 'display'));
    await context.step('messageBack, replyToId', () =>
      ops.sendMessageBack(undefined, undefined, undefined, { replyToId: 'r1' })
    );
    await context.step('postBack string', () => ops.sendPostBack('pb'));
    await context.step('postBack object, replyToId', () => ops.sendPostBack({ a: 1 }, { replyToId: 'r1' }));
    await context.step('postBack undefined', () => ops.sendPostBack(undefined));
    await context.step('all return and echo', () => sendAll(mock));
  },
  'sendEvent, sendFiles': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('event', () => ops.sendEvent('ev', { a: 1 }));
    await context.step('event without value', () => ops.sendEvent('ev2'));
    await context.step('event without name', () => ops.sendEvent(''));
    await context.step('files', () =>
      ops.sendFiles([
        { name: 'a.png', size: 3, thumbnail: 'data:t', url: 'blob:a' },
        { name: 'b.unknownext', size: 4, url: 'blob:b' }
      ])
    );
    await context.step('no files', () => ops.sendFiles([]));
    await context.step('all return and echo', () => sendAll(mock));
  },
  'senders before connect and after disconnect': async context => {
    const mock = context.createDirectLine(DIRECT_LINE);
    const { ops } = context.driver;

    await context.step('send before connect', () => {
      ops.sendMessage('m');
      ops.sendEvent('e', 1);
      ops.sendPostBack('p');
    });
    await context.step('connect', () =>
      context.driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' })
    );
    await context.step('send while connecting', () => ops.sendMessage('connecting'));
    await context.step('online', () => mock.emitStatus(2));
    await context.step('send', () => ops.sendMessage('online'));
    await context.step('disconnect', () => context.driver.disconnect());
    await context.step('send after disconnect', () => ops.sendMessage('after'));
  },
  'senders in one turn': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('message, event, postBack, messageBack, files', () => {
      ops.sendMessage('m');
      ops.sendEvent('e', 1);
      ops.sendPostBack('p');
      ops.sendMessageBack('v', 't', 'd');
      ops.sendFiles([{ name: 'a.txt', size: 1, url: 'blob:a' }]);
    });
    await context.step('all return and echo', () => sendAll(mock));
  },

  // Suggested actions.
  'suggested actions cleared by a message only': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('bot message with suggested actions', () =>
      mock.emitActivity(botMessage('b1', 1_000, { suggestedActions: { actions: ACTIONS } }))
    );
    await context.step('event', () => ops.sendEvent('ev', 1));
    await context.step('typing', () => ops.emitTypingIndicator());
    await context.step('message', () => ops.sendMessage('hello'));
    await context.step('another message', () => ops.postActivity({ text: 'again', type: 'message' }));
    await context.step('all return and echo', () => sendAll(mock));
  },
  clearSuggestedActions: async context => {
    const mock = await connectOnline(context);

    await context.step('bot message with suggested actions', () =>
      mock.emitActivity(botMessage('b1', 1_000, { suggestedActions: { actions: ACTIONS } }))
    );
    await context.step('clear', () => context.driver.ops.clearSuggestedActions());
    await context.step('clear when offline', () => {
      context.driver.disconnect();
      context.driver.ops.clearSuggestedActions();
    });
  },
  'a message failing to post clears the suggested actions': async context => {
    const mock = await connectOnline(context);

    await context.step('bot message with suggested actions', () =>
      mock.emitActivity(botMessage('b1', 1_000, { suggestedActions: { actions: ACTIONS } }))
    );
    await context.step('message that throws', () => {
      mock.setPostThrows(true);
      context.driver.ops.sendMessage('hello');
    });
  },

  // Marking an activity.
  markActivity: async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('bot message', () => mock.emitActivity(botMessage('b1', 1_000)));
    await context.step('mark', () => ops.markActivity({ id: 'b1' }, 'x-custom', 1));
    await context.step('mark again, same value', () => ops.markActivity({ id: 'b1' }, 'x-custom', 1));
    await context.step('mark a missing activity', () => ops.markActivity({ id: 'missing' }, 'x-custom', 2));
    await context.step('mark a reserved name', () => logThrow(() => ops.markActivity({ id: 'b1' }, 'state', 'x')));
    await context.step('disconnect, mark', () => {
      context.driver.disconnect();
      ops.markActivity({ id: 'b1' }, 'x-custom', 3);
    });
  },

  // The send box.
  'submit: value': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('set the value', () => ops.setSendBox('  hello  '));
    await context.step('submit', () => ops.submitSendBox());
    await context.step('returns, echo', () => sendAll(mock));
  },
  'submit: method and channelData': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('set the value', () => ops.setSendBox('hello'));
    await context.step('submit by speech with channelData', () =>
      ops.submitSendBox('speech', { channelData: { a: 1 } })
    );
    await context.step('returns, echo', () => sendAll(mock));
  },
  'submit: attachments': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('set the attachments', () => ops.setSendBoxAttachments([{ blob: PNG() }]));
    await context.step('submit the attachments', () => ops.submitSendBox());
    await context.step('set both', () => {
      ops.setSendBox('with file');
      ops.setSendBoxAttachments([{ blob: BLOB() }]);
    });
    await context.step('submit both', () => ops.submitSendBox());
    await context.step('all return and echo', () => sendAll(mock));
  },
  'submit: whitespace, empty': async context => {
    await connectOnline(context);
    const { ops } = context.driver;

    await context.step('submit empty', () => ops.submitSendBox());
    await context.step('set whitespace', () => ops.setSendBox('   '));
    await context.step('submit whitespace', () => ops.submitSendBox());
  },
  'submit: offline keeps the send box': async context => {
    const mock = context.createDirectLine(DIRECT_LINE);
    const { ops } = context.driver;

    await context.step('set the value and attachments', () => {
      ops.setSendBox('hello');
      ops.setSendBoxAttachments([{ blob: BLOB() }]);
    });
    await context.step('submit before connect', () => ops.submitSendBox());
    await context.step('connect', () =>
      context.driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' })
    );
    await context.step('submit while connecting', () => ops.submitSendBox());
    await context.step('online', () => mock.emitStatus(2));
    await context.step('reconnecting', () => mock.emitStatus(1));
    await context.step('submit while reconnecting', () => ops.submitSendBox());
    await context.step('reconnected, submit', () => {
      mock.emitStatus(2);
      ops.submitSendBox();
    });
    await context.step('submit when online', () => ops.submitSendBox());
    await context.step('disconnect, set, submit', () => {
      context.driver.disconnect();
      ops.setSendBox('after');
      ops.submitSendBox();
    });
  },
  'submit twice in one turn': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('set, submit, set, submit', () => {
      ops.setSendBox('first');
      ops.submitSendBox();
      ops.setSendBox('second');
      ops.submitSendBox();
    });
    await context.step('all return and echo', () => sendAll(mock));
  },
  'submit and set the send box in one turn': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('set, submit, set', () => {
      ops.setSendBox('first');
      ops.submitSendBox();
      ops.setSendBox('typed after');
    });
    await context.step('all return and echo', () => sendAll(mock));
  },
  'submit: postActivity() throws': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('set the value and attachments', () => {
      ops.setSendBox('hello');
      ops.setSendBoxAttachments([{ blob: BLOB() }]);
    });
    await context.step('submit, postActivity() throws', () => {
      mock.setPostThrows(true);
      ops.submitSendBox();
    });
  },
  'submit: invalid attachments': async context => {
    await connectOnline(context);
    const { ops } = context.driver;

    await context.step('set invalid attachments', () => ops.setSendBoxAttachments([{ blob: 'not a blob' }]));
    await context.step('submit', () => ops.submitSendBox());
  },
  'send box: undefined values throw to the caller, as the reducers do, and change nothing': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('typing on, locale, send timeout, value, attachments', () => {
      ops.setSendTypingIndicator(true);
      ops.setLanguage('fr-FR');
      ops.setSendTimeout(5_000);
      ops.setSendBox('a');
      ops.setSendBoxAttachments([{ blob: BLOB() }]);
    });
    await context.step('send box undefined', () => logThrow(() => ops.setSendBox(undefined)));
    await context.step('attachments undefined', () => logThrow(() => ops.setSendBoxAttachments(undefined)));
    await context.step('typing indicator undefined', () => logThrow(() => ops.setSendTypingIndicator(undefined)));
    await context.step('locale undefined', () => logThrow(() => ops.setLanguage(undefined)));
    await context.step('send timeout undefined', () => logThrow(() => ops.setSendTimeout(undefined)));
    // Still typing, still in French, still 5 seconds.
    await context.step('t=3000, type', () => {
      context.clock.tick(3_000);
      ops.setSendBox('ab');
    });
    await context.step('post', () => ops.sendMessage('hello'));
    await context.step('t=8000', () => context.clock.tick(5_000));
    await context.step('all return and echo', () => sendAll(mock));
  },
  'send box values': async context => {
    const { ops } = context.driver;
    const attachments = Object.freeze([{ blob: BLOB() }]);

    await context.step('set value', () => ops.setSendBox('a'));
    await context.step('same value', () => ops.setSendBox('a'));
    await context.step('empty value', () => ops.setSendBox(''));
    await context.step('set attachments', () => ops.setSendBoxAttachments(attachments));
    await context.step('same attachments', () => ops.setSendBoxAttachments(attachments));
    await context.step('empty attachments', () => ops.setSendBoxAttachments([]));
    await context.step('typing on, off', () => {
      ops.setSendTypingIndicator(true);
      ops.setSendTypingIndicator(true);
      ops.setSendTypingIndicator(false);
    });
  },

  // Typing indicator.
  'typing: off sends nothing': async context => {
    await connectOnline(context);

    await context.step('type', () => context.driver.ops.setSendBox('a'));
    await context.step('t=3000, type', () => {
      context.clock.tick(3_000);
      context.driver.ops.setSendBox('ab');
    });
  },
  'typing: at 0, 3 and 6 s while typing': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('typing on', () => ops.setSendTypingIndicator(true));

    for (const [time, text] of [
      [0, 'a'],
      [1_000, 'ab'],
      [1_000, 'abc'],
      [1_000, 'abcd'],
      [500, 'abcde'],
      [2_500, 'abcdef'],
      [3_500, 'abcdefg']
    ] as const) {
      // eslint-disable-next-line no-await-in-loop
      await context.step(`+${time}, "${text}"`, () => {
        context.clock.tick(time);
        ops.setSendBox(text);
      });
    }

    await context.step('t=12000', () => context.clock.tick(3_000));
    await context.step('all return and echo', () => sendAll(mock));
  },
  'typing: a message at 1.5 s cancels the pending typing and resets': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('typing on, type', () => {
      ops.setSendTypingIndicator(true);
      ops.setSendBox('a');
    });
    await context.step('t=1000, type', () => {
      context.clock.tick(1_000);
      ops.setSendBox('ab');
    });
    await context.step('t=1500, send a message', () => {
      context.clock.tick(500);
      ops.sendMessage('ab');
    });
    await context.step('t=3000', () => context.clock.tick(1_500));
    await context.step('t=3500, type', () => {
      context.clock.tick(500);
      ops.setSendBox('c');
    });
    await context.step('all return and echo', () => sendAll(mock));
  },
  'typing: an event at 1.5 s cancels the pending typing without resetting': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('typing on, type', () => {
      ops.setSendTypingIndicator(true);
      ops.setSendBox('a');
    });
    await context.step('t=1000, type', () => {
      context.clock.tick(1_000);
      ops.setSendBox('ab');
    });
    await context.step('t=1500, send an event', () => {
      context.clock.tick(500);
      ops.sendEvent('ev', 1);
    });
    await context.step('t=2000, type', () => {
      context.clock.tick(500);
      ops.setSendBox('abc');
    });
    await context.step('t=3000', () => context.clock.tick(1_000));
    await context.step('all return and echo', () => sendAll(mock));
  },
  'typing: a typing post does not cancel the pending typing': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('typing on, type', () => {
      ops.setSendTypingIndicator(true);
      ops.setSendBox('a');
    });
    await context.step('t=1000, type', () => {
      context.clock.tick(1_000);
      ops.setSendBox('ab');
    });
    await context.step('t=1500, emit typing', () => {
      context.clock.tick(500);
      ops.emitTypingIndicator();
    });
    await context.step('t=3000', () => context.clock.tick(1_500));
    await context.step('all return and echo', () => sendAll(mock));
  },
  'typing: the same text twice, empty text': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('typing on, type', () => {
      ops.setSendTypingIndicator(true);
      ops.setSendBox('a');
    });
    await context.step('t=1000, same text', () => {
      context.clock.tick(1_000);
      ops.setSendBox('a');
    });
    await context.step('t=2000, empty text', () => {
      context.clock.tick(1_000);
      ops.setSendBox('');
    });
    await context.step('t=3000', () => context.clock.tick(1_000));
    await context.step('t=7000, empty text', () => {
      context.clock.tick(4_000);
      ops.setSendBox('');
    });
    await context.step('all return and echo', () => sendAll(mock));
  },
  'typing: off with a pending typing, then on': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('typing on, type', () => {
      ops.setSendTypingIndicator(true);
      ops.setSendBox('a');
    });
    await context.step('t=1000, type', () => {
      context.clock.tick(1_000);
      ops.setSendBox('ab');
    });
    await context.step('t=1500, typing off', () => {
      context.clock.tick(500);
      ops.setSendTypingIndicator(false);
    });
    await context.step('t=3000, type', () => {
      context.clock.tick(1_500);
      ops.setSendBox('abc');
    });
    await context.step('t=3500, typing on, type', () => {
      context.clock.tick(500);
      ops.setSendTypingIndicator(true);
      ops.setSendBox('abcd');
    });
    await context.step('t=4000, type', () => {
      context.clock.tick(500);
      ops.setSendBox('abcde');
    });
    await context.step('t=6500', () => context.clock.tick(2_500));
    await context.step('all return and echo', () => sendAll(mock));
  },
  'typing: on before connect': async context => {
    const mock = context.createDirectLine(DIRECT_LINE);
    const { ops } = context.driver;

    await context.step('typing on, type', () => {
      ops.setSendTypingIndicator(true);
      ops.setSendBox('a');
    });
    await context.step('connect', () =>
      context.driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' })
    );
    await context.step('type while connecting', () => ops.setSendBox('ab'));
    await context.step('online', () => mock.emitStatus(2));
    await context.step('type', () => ops.setSendBox('abc'));
    await context.step('returns, echo', () => sendAll(mock));
  },
  'typing: on and off in one turn, off then on': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('on, off, type', () => {
      ops.setSendTypingIndicator(true);
      ops.setSendTypingIndicator(false);
      ops.setSendBox('a');
    });
    await context.step('on, type', () => {
      ops.setSendTypingIndicator(true);
      ops.setSendBox('ab');
    });
    await context.step('off, on, type', () => {
      ops.setSendTypingIndicator(false);
      ops.setSendTypingIndicator(true);
      ops.setSendBox('abc');
    });
    await context.step('t=3000', () => context.clock.tick(3_000));
    await context.step('all return and echo', () => sendAll(mock));
  },
  'typing: across a reconnect': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('typing on, type', () => {
      ops.setSendTypingIndicator(true);
      ops.setSendBox('a');
    });
    await context.step('t=1000, type', () => {
      context.clock.tick(1_000);
      ops.setSendBox('ab');
    });
    await context.step('reconnecting', () => mock.emitStatus(1));
    await context.step('t=3000', () => context.clock.tick(2_000));
    await context.step('reconnected, type', () => {
      mock.emitStatus(2);
      ops.setSendBox('abc');
    });
    await context.step('t=4000, type', () => {
      context.clock.tick(1_000);
      ops.setSendBox('abcd');
    });
    await context.step('t=6000', () => context.clock.tick(2_000));
    await context.step('all return and echo', () => sendAll(mock));
  },
  'typing: submit while typing': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('typing on, type', () => {
      ops.setSendTypingIndicator(true);
      ops.setSendBox('a');
    });
    await context.step('t=1000, type, submit', () => {
      context.clock.tick(1_000);
      ops.setSendBox('ab');
      ops.submitSendBox();
    });
    await context.step('t=1500, type', () => {
      context.clock.tick(500);
      ops.setSendBox('c');
    });
    await context.step('t=4500', () => context.clock.tick(3_000));
    await context.step('all return and echo', () => sendAll(mock));
  },
  'typing: the typing post is impeded and rejected': async context => {
    const mock = await connectOnline(context);

    await context.step('typing on, type', () => {
      context.driver.ops.setSendTypingIndicator(true);
      context.driver.ops.setSendBox('a');
    });
    await context.step('returns', () => mock.post(1).next());
    await context.step('t=20000', () => context.clock.tick(20_000));
    await context.step('t=300000', () => context.clock.tick(280_000));
  },

  // The actions that card action middleware can dispatch (the store's `dispatch()` in Redux mode).
  'dispatch: the send actions': async context => {
    const mock = await connectOnline(context);
    const { rawDispatch } = context.driver;

    await context.step('SEND_MESSAGE', () => rawDispatch({ payload: { text: 'm' }, type: 'WEB_CHAT/SEND_MESSAGE' }));
    await context.step('SEND_MESSAGE, not validated', () =>
      rawDispatch({ payload: { channelData: 1, text: 'm2', unknown: 1 }, type: 'WEB_CHAT/SEND_MESSAGE' })
    );
    await context.step('SEND_MESSAGE_BACK', () =>
      rawDispatch({ payload: { displayText: 'd', text: 't', value: 1 }, type: 'WEB_CHAT/SEND_MESSAGE_BACK' })
    );
    await context.step('SEND_POST_BACK', () =>
      rawDispatch({ payload: { value: 'p' }, type: 'WEB_CHAT/SEND_POST_BACK' })
    );
    await context.step('SEND_EVENT', () =>
      rawDispatch({ payload: { name: 'e', value: 1 }, type: 'WEB_CHAT/SEND_EVENT' })
    );
    await context.step('SEND_FILES', () =>
      rawDispatch({ payload: { files: [{ name: 'a.txt', size: 1, url: 'blob:a' }] }, type: 'WEB_CHAT/SEND_FILES' })
    );
    await context.step('POST_ACTIVITY', () =>
      rawDispatch({
        meta: { method: 'code' },
        payload: { activity: { text: 'raw', type: 'message' } },
        type: 'DIRECT_LINE/POST_ACTIVITY'
      })
    );
    await context.step('all return and echo', () => sendAll(mock));
  },
  'dispatch: the send actions when offline': async context => {
    const { rawDispatch } = context.driver;

    await context.step('SEND_MESSAGE, POST_ACTIVITY without meta', () => {
      rawDispatch({ payload: { text: 'm' }, type: 'WEB_CHAT/SEND_MESSAGE' });
      rawDispatch({ payload: { activity: { text: 'raw', type: 'message' } }, type: 'DIRECT_LINE/POST_ACTIVITY' });
    });
  },
  'dispatch: POST_ACTIVITY without meta when online': async context => {
    const mock = await connectOnline(context);

    await context.step('POST_ACTIVITY without meta', () =>
      context.driver.rawDispatch({
        payload: { activity: { text: 'raw', type: 'message' } },
        type: 'DIRECT_LINE/POST_ACTIVITY'
      })
    );
    await context.step('post after', () => context.driver.ops.postActivity({ text: 'after', type: 'message' }));
    await context.step('activity after', () => mock.emitActivity(botMessage('b1', 1_000)));
  },
  'dispatch: SEND_MESSAGE with a wrong payload when online': async context => {
    await connectOnline(context);

    await context.step('SEND_MESSAGE, attachments not an array', () =>
      logThrow(() =>
        context.driver.rawDispatch({ payload: { attachments: 1, text: 'm' }, type: 'WEB_CHAT/SEND_MESSAGE' })
      )
    );
    await context.step('post after', () => context.driver.ops.postActivity({ text: 'after', type: 'message' }));
  }
});

export default sendScripts;
