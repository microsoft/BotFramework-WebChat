/* eslint-disable no-magic-numbers, no-restricted-globals */
// The scripts of the speech parity spec: speaking the incoming activities and starting the dictation after them
// (`speakActivityAndStartDictateOnIncomingActivityFromOthersSaga`, `startDictateOnSpeakCompleteSaga`), stopping the
// speech (`markAllAsSpokenOnStopSpeakActivitySaga`, `stopSpeakingActivityOnInputSaga`), and the posts that start the
// speech or stop the dictation (`startSpeakActivityOnPostActivitySaga`, `stopDictateOnCardActionSaga`).
//
// No Web Speech: the scripts play the components that call the speech operations, as they do (`components()`), with
// the values they would render (the current ones).
import { DICTATING, IDLE, STARTING, STOPPING, WILL_START } from '../../constants/DictateState';
import type { MockDirectLine, MockDirectLineInit } from './createMockDirectLine';
import type { Script, ScriptContext } from './runParityScript';

const DIRECT_LINE: MockDirectLineInit = Object.freeze({ name: 'dl1', replayStatus: true });

const BOT = Object.freeze({ id: 'bot', role: 'bot' });
const ACTIONS = Object.freeze([Object.freeze({ title: 'A', type: 'imBack', value: 'a' })]);

const DICTATE_STATES: readonly (readonly [string, number])[] = Object.freeze([
  ['IDLE', IDLE],
  ['WILL_START', WILL_START],
  ['STARTING', STARTING],
  ['DICTATING', DICTATING],
  ['STOPPING', STOPPING]
]);

type InputHint = 'acceptingInput' | 'expectingInput' | 'ignoringInput' | undefined;

const INPUT_HINTS: readonly InputHint[] = Object.freeze([
  'expectingInput',
  'acceptingInput',
  'ignoringInput',
  undefined
]);

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

/**
 * What the components do with the speech operations, in both modes, reading the values they would render:
 * `<Dictation>` (`react-dictate-button` events), `<Speak>` (end of the synthesis), the microphone button, the text box,
 * and a card action (`<Composer>`, not continuous, then imBack).
 */
function components({ driver: { observe, ops } }: ScriptContext) {
  const isDictating = () => {
    const { dictateState } = observe();

    return dictateState === DICTATING || dictateState === STARTING;
  };

  return Object.freeze({
    cardAction: (value: string) => {
      ops.stopDictate();
      ops.sendMessage(value, 'imBack');
    },
    // `onEnd` and `onError` of the dictation.
    dictationEnd: () => {
      const { dictateState } = observe();

      dictateState !== IDLE && ops.setDictateState(IDLE);
      (dictateState === DICTATING || dictateState === STARTING) && ops.stopDictate();
    },
    micClick: () => {
      const { dictateInterims, dictateState } = observe();

      if (dictateState === WILL_START) {
        ops.stopSpeakingActivity();
      } else if (dictateState === DICTATING) {
        ops.stopDictate();
        ops.setSendBox(dictateInterims.join(' '));
      } else {
        ops.stopSpeakingActivity();
        ops.startDictate();
      }
    },
    // `onProgress` of the dictation.
    progress: (interims: readonly string[]) => {
      if (isDictating()) {
        ops.setDictateInterims(interims);
        ops.setDictateState(DICTATING);
        observe().sendTypingIndicator && ops.emitTypingIndicator();
      }
    },
    // `onDictate` of the dictation.
    recognize: (transcript: string) => {
      if (isDictating()) {
        ops.setDictateInterims([]);

        if (transcript) {
          ops.setSendBox(transcript);
          ops.submitSendBox('speech', { channelData: { speech: { alternatives: [{ confidence: 0.9, transcript }] } } });
          ops.startSpeakingActivity();
        }
      }
    },
    // `<Speak>`: the synthesis of the activity ended (or failed).
    speakEnd: (id: string) => ops.markActivity({ id }, 'speak', false),
    // The text box: sets the value, then stops the dictation.
    typeKey: (text: string) => {
      ops.setSendBox(text);
      ops.stopDictate();
    }
  });
}

/** One bot message with the input hint, with or without the speech of the incoming activities. */
function inputHintScript(inputHint: InputHint, spoken: boolean): Script {
  return async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;
    const ui = components(context);

    spoken && (await context.step('speak incoming', () => ops.startSpeakingActivity()));
    await context.step('bot message', () => mock.emitActivity(botMessage('b1', 1_000, { inputHint })));
    await context.step('speech ends', () => ui.speakEnd('b1'));
    await context.step('progress', () => ui.progress(['hel']));
    await context.step('recognized', () => ui.recognize('hello'));
    await context.step('return, echo', () => sendAll(mock));
    await context.step('dictation ends', () => ui.dictationEnd());
  };
}

/** Two spoken bot messages in one turn, with these input hints (`speech/inputHint/consecutive/`). */
function consecutiveScript(first: InputHint, second: InputHint): Script {
  return async context => {
    const mock = await connectOnline(context);
    const ui = components(context);

    await context.step('speak incoming', () => context.driver.ops.startSpeakingActivity());
    await context.step('2 bot messages', () => {
      mock.emitActivity(botMessage('b1', 1_000, { inputHint: first }));
      mock.emitActivity(botMessage('b2', 2_000, { inputHint: second }));
    });
    await context.step('first speech ends', () => ui.speakEnd('b1'));
    await context.step('second speech ends', () => ui.speakEnd('b2'));
  };
}

/** Runs `fn` for each dictate state, one after the other. */
async function forEachDictateState(fn: (name: string, value: number) => Promise<void>): Promise<void> {
  for (const entry of DICTATE_STATES) {
    // eslint-disable-next-line no-await-in-loop
    await fn(entry[0], entry[1]);
  }
}

/** In each dictate state: what an input does (set with `setDictateState()`, as in continuous mode). */
function inEachDictateState(input: (context: ScriptContext, mock: MockDirectLine) => void): Script {
  return async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await forEachDictateState(async (name, value) => {
      await context.step(`${name}: speak incoming`, () => {
        ops.setDictateState(value);
        ops.startSpeakingActivity();
      });
      await context.step(`${name}: input`, () => input(context, mock));
      await context.step(`${name}: return, echo`, () => sendAll(mock));
      await context.step(`${name}: reset`, () => {
        ops.stopSpeakingActivity();
        ops.setDictateState(IDLE);
      });
    });
  };
}

const HINT_NAMES: Readonly<Record<string, string>> = Object.freeze({
  acceptingInput: 'accepting',
  expectingInput: 'expecting',
  ignoringInput: 'ignoring',
  undefined: 'no hint'
});

const generated: Record<string, Script> = {};

for (const inputHint of INPUT_HINTS) {
  for (const spoken of [true, false]) {
    generated[`inputHint: ${HINT_NAMES[String(inputHint)]}, ${spoken ? 'spoken' : 'not spoken'}`] = inputHintScript(
      inputHint,
      spoken
    );
  }
}

for (const first of INPUT_HINTS.slice(0, 3)) {
  for (const second of INPUT_HINTS.slice(0, 3)) {
    const name = `inputHint: consecutive ${HINT_NAMES[String(first)]}, ${HINT_NAMES[String(second)]}`;

    // eslint-disable-next-line security/detect-object-injection
    generated[name] = consecutiveScript(first, second);
  }
}

const speechScripts: Readonly<Record<string, Script>> = Object.freeze({
  ...generated,

  // What is spoken.
  'speakable: text, speak, attachment speak, nothing': async context => {
    const mock = await connectOnline(context);

    await context.step('speak incoming', () => context.driver.ops.startSpeakingActivity());
    await context.step('text', () => mock.emitActivity(botMessage('b1', 1_000)));
    await context.step('speak only', () => mock.emitActivity(botMessage('b2', 2_000, { speak: 'b2', text: '' })));
    await context.step('attachment speak', () =>
      mock.emitActivity(
        botMessage('b3', 3_000, {
          attachments: [{ content: {} }, { content: { speak: 'card' }, contentType: 'x' }],
          text: ''
        })
      )
    );
    await context.step('attachments without speak', () =>
      mock.emitActivity(botMessage('b4', 4_000, { attachments: [{ content: {} }, {}], text: '' }))
    );
    await context.step('nothing', () => mock.emitActivity(botMessage('b5', 5_000, { text: '' })));
    await context.step('an event, expecting input', () =>
      mock.emitActivity({
        from: BOT,
        id: 'b6',
        inputHint: 'expectingInput',
        name: 'x',
        timestamp: new Date(6_000).toISOString(),
        type: 'event'
      })
    );
  },
  'quirk: an attachment with content null on a spoken message without text stops everything': async context => {
    const mock = await connectOnline(context);
    const ui = components(context);

    await context.step('speak incoming', () => context.driver.ops.startSpeakingActivity());
    await context.step('bot message, speaking', () =>
      mock.emitActivity(botMessage('b1', 1_000, { inputHint: 'expectingInput' }))
    );
    await context.step('attachment with content null', () =>
      mock.emitActivity(botMessage('b2', 2_000, { attachments: [{ content: null }], text: '' }))
    );
    await context.step('stop speaking', () => context.driver.ops.stopSpeakingActivity());
    await context.step('speech ends', () => ui.speakEnd('b1'));
    await context.step('will start, again', () => context.driver.ops.setDictateState(WILL_START));
    await context.step('post', () => context.driver.ops.sendMessage('after'));
  },
  'content null with text: spoken': async context => {
    const mock = await connectOnline(context);

    await context.step('speak incoming', () => context.driver.ops.startSpeakingActivity());
    await context.step('attachment with content null', () =>
      mock.emitActivity(botMessage('b1', 1_000, { attachments: [{ content: null }] }))
    );
  },
  'quirk: ignoring input stops the dictation, also when not spoken': async context => {
    const mock = await connectOnline(context);

    await context.step('starting', () => context.driver.ops.startDictate());
    await context.step('ignoring, not spoken', () =>
      mock.emitActivity(botMessage('b1', 1_000, { inputHint: 'ignoringInput' }))
    );
  },
  'not from others: the echo, role user, from the user ID': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('speak incoming', () => ops.startSpeakingActivity());
    await context.step('post', () => ops.sendMessage('hello'));
    await context.step('return, echo', () => sendAll(mock));
    await context.step('role user', () =>
      mock.emitActivity({
        from: { id: 'other', role: 'user' },
        id: 'u1',
        inputHint: 'ignoringInput',
        text: 'x',
        timestamp: new Date(2_000).toISOString(),
        type: 'message'
      })
    );
    await context.step('from the user ID', () =>
      mock.emitActivity({
        from: { id: 'u-1' },
        id: 'u2',
        inputHint: 'expectingInput',
        text: 'y',
        timestamp: new Date(3_000).toISOString(),
        type: 'message'
      })
    );
  },
  'expecting input with suggested actions: marked, then suggested actions, then will start': async context => {
    const mock = await connectOnline(context);
    const ui = components(context);

    await context.step('speak incoming', () => context.driver.ops.startSpeakingActivity());
    await context.step('bot message', () =>
      mock.emitActivity(
        botMessage('b1', 1_000, { inputHint: 'expectingInput', suggestedActions: { actions: ACTIONS, to: [] } })
      )
    );
    await context.step('speech ends', () => ui.speakEnd('b1'));
  },
  'two spoken messages with suggested actions in one turn': async context => {
    const mock = await connectOnline(context);
    const ui = components(context);

    await context.step('speak incoming', () => context.driver.ops.startSpeakingActivity());
    await context.step('2 bot messages', () => {
      mock.emitActivity(
        botMessage('b1', 1_000, { inputHint: 'expectingInput', suggestedActions: { actions: ACTIONS, to: [] } })
      );
      mock.emitActivity(
        botMessage('b2', 2_000, { inputHint: 'acceptingInput', suggestedActions: { actions: ACTIONS, to: [] } })
      );
    });
    await context.step('speech ends', () => {
      ui.speakEnd('b1');
      ui.speakEnd('b2');
    });
  },
  'a reply held, then released with its target': async context => {
    const mock = await connectOnline(context);

    await context.step('bot message', () => mock.emitActivity(botMessage('b0', 500)));
    await context.step('speak incoming', () => context.driver.ops.startSpeakingActivity());
    await context.step('reply first', () =>
      mock.emitActivity(botMessage('b2', 2_000, { inputHint: 'expectingInput', replyToId: 'b1' }))
    );
    await context.step('then its target', () =>
      mock.emitActivity(botMessage('b1', 1_000, { inputHint: 'ignoringInput' }))
    );
  },

  // Starting the dictation after the speech.
  'auto start after 2 spoken messages': async context => {
    const mock = await connectOnline(context);
    const ui = components(context);

    await context.step('speak incoming', () => context.driver.ops.startSpeakingActivity());
    await context.step('first', () => mock.emitActivity(botMessage('b1', 1_000, { inputHint: 'acceptingInput' })));
    await context.step('second, expecting', () =>
      mock.emitActivity(botMessage('b2', 2_000, { inputHint: 'expectingInput' }))
    );
    await context.step('second speech ends first', () => ui.speakEnd('b2'));
    await context.step('first speech ends', () => ui.speakEnd('b1'));
    await context.step('progress', () => ui.progress(['a', 'b']));
    await context.step('recognized', () => ui.recognize('a b'));
    await context.step('return, echo', () => sendAll(mock));
  },
  'will start with nothing to speak: starts at once': async context => {
    const mock = await connectOnline(context);

    await context.step('speak incoming', () => context.driver.ops.startSpeakingActivity());
    await context.step('expecting, nothing to speak', () =>
      mock.emitActivity(botMessage('b1', 1_000, { inputHint: 'expectingInput', text: '' }))
    );
  },
  // Not "set …": a key starting with "set " breaks the async-to-generator transform of Babel.
  'dictate state set: the auto start runs also when unchanged': async context => {
    await connectOnline(context);
    const { ops } = context.driver;

    await context.step('will start', () => ops.setDictateState(WILL_START));
    await context.step('starting, again', () => ops.setDictateState(STARTING));
    await context.step('starting again, unchanged', () => ops.setDictateState(STARTING));
    await context.step('will start, twice', () => {
      ops.setDictateState(WILL_START);
      ops.setDictateState(WILL_START);
    });
    await context.step('idle', () => ops.setDictateState(IDLE));
  },
  'quirk: any mark re-checks the auto start (a "read" mark while will start)': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('bot message', () => mock.emitActivity(botMessage('b1', 1_000)));
    await context.step('speak incoming', () => ops.startSpeakingActivity());
    await context.step('expecting, spoken', () =>
      mock.emitActivity(botMessage('b2', 2_000, { inputHint: 'expectingInput' }))
    );
    await context.step('read mark of b1', () => ops.markActivity({ id: 'b1' }, 'read', true));
    await context.step('b2 not spoken any more, by another name', () => ops.markActivity({ id: 'b2' }, 'x', 1));
    await context.step('mark b2 spoken', () => ops.markActivity({ id: 'b2' }, 'speak', false));
    await context.step('mark of an unknown activity', () => ops.markActivity({ id: 'nope' }, 'speak', false));
  },
  'mark: a reserved name throws to the caller, nothing else happens': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('bot message', () => mock.emitActivity(botMessage('b1', 1_000)));
    await context.step('will start', () => ops.setDictateState(WILL_START));
    await context.step('starting, set will start again', () => ops.setDictateState(WILL_START));
    await context.step('reserved name', () => logThrow(() => ops.markActivity({ id: 'b1' }, 'webchat:x', 1)));
    await context.step('state', () => logThrow(() => ops.markActivity({ id: 'b1' }, 'state', 1)));
  },

  // Stopping the speech.
  'stop speaking: marks every spoken activity, then starts the dictation': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('speak incoming', () => ops.startSpeakingActivity());
    await context.step('3 spoken', () => {
      mock.emitActivity(botMessage('b1', 1_000));
      mock.emitActivity(botMessage('b2', 2_000, { inputHint: 'expectingInput' }));
      mock.emitActivity(botMessage('b3', 3_000));
    });
    await context.step('stop speaking', () => ops.stopSpeakingActivity());
    await context.step('stop speaking again', () => ops.stopSpeakingActivity());
  },
  'barge-in: interims stop the speech, also empty ones': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;
    const ui = components(context);

    await context.step('speak incoming', () => ops.startSpeakingActivity());
    await context.step('spoken', () => mock.emitActivity(botMessage('b1', 1_000, { inputHint: 'acceptingInput' })));
    await context.step('start dictating (continuous)', () => ops.setDictateState(DICTATING));
    await context.step('progress', () => ui.progress(['he']));
    await context.step('speak incoming again', () => ops.startSpeakingActivity());
    await context.step('spoken again', () => mock.emitActivity(botMessage('b2', 2_000)));
    await context.step('empty interims', () => ops.setDictateInterims([]));
    await context.step('empty interims again', () => ops.setDictateInterims([]));
  },
  'quirk: typing through the hook while will start starts the microphone; the text box does not': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;
    const ui = components(context);

    await context.step('speak incoming', () => ops.startSpeakingActivity());
    await context.step('expecting, spoken', () =>
      mock.emitActivity(botMessage('b1', 1_000, { inputHint: 'expectingInput' }))
    );
    await context.step('set send box (hook)', () => ops.setSendBox('a'));
    await context.step('idle', () => ops.setDictateState(IDLE));
    await context.step('speak incoming again', () => ops.startSpeakingActivity());
    await context.step('expecting, spoken again', () =>
      mock.emitActivity(botMessage('b2', 2_000, { inputHint: 'expectingInput' }))
    );
    await context.step('type (text box)', () => ui.typeKey('ab'));
    await context.step('set send box empty', () => ops.setSendBox(''));
  },
  'typing with the typing indicator while speaking': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('typing indicator on', () => ops.setSendTypingIndicator(true));
    await context.step('speak incoming', () => ops.startSpeakingActivity());
    await context.step('spoken', () => mock.emitActivity(botMessage('b1', 1_000, { inputHint: 'expectingInput' })));
    await context.step('type', () => ops.setSendBox('a'));
    await context.step('speak incoming again', () => ops.startSpeakingActivity());
    await context.step('spoken again', () => mock.emitActivity(botMessage('b2', 2_000)));
    await context.step('t=3000, type', () => {
      context.clock.tick(3_000);
      ops.setSendBox('ab');
    });
  },
  'typing indicator enabled while online, then typing while speaking': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('speak incoming', () => ops.startSpeakingActivity());
    await context.step('spoken', () => mock.emitActivity(botMessage('b1', 1_000)));
    await context.step('typing indicator on', () => ops.setSendTypingIndicator(true));
    await context.step('type', () => ops.setSendBox('a'));
    await context.step('t=3000, speak incoming again', () => {
      context.clock.tick(3_000);
      ops.startSpeakingActivity();
    });
    await context.step('spoken again', () => mock.emitActivity(botMessage('b2', 2_000)));
    await context.step('type again', () => ops.setSendBox('ab'));
    await context.step('return, echo', () => sendAll(mock));
    await context.step('t=6000, speak incoming, spoken', () => {
      context.clock.tick(3_000);
      ops.startSpeakingActivity();
      mock.emitActivity(botMessage('b3', 3_000));
    });
    await context.step('type once more', () => ops.setSendBox('abc'));
  },

  // The microphone button.
  'microphone button in each dictate state': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;
    const ui = components(context);

    await forEachDictateState(async (name, value) => {
      await context.step(`${name}: speak incoming, spoken`, () => {
        ops.setDictateState(value);
        ops.setDictateInterims(['x', 'y']);
        ops.startSpeakingActivity();
        mock.emitActivity(botMessage(`b-${name}`, 1_000 + value));
      });
      await context.step(`${name}: click`, () => ui.micClick());
      await context.step(`${name}: reset`, () => {
        ops.setDictateInterims([]);
        ops.setDictateState(IDLE);
      });
    });
  },
  'microphone button: speak, will start, click cancels the auto start': async context => {
    const mock = await connectOnline(context);
    const ui = components(context);

    await context.step('click', () => ui.micClick());
    await context.step('progress', () => ui.progress(['he']));
    await context.step('recognized', () => ui.recognize('hello'));
    await context.step('return, echo', () => sendAll(mock));
    await context.step('expecting, spoken', () =>
      mock.emitActivity(botMessage('b1', 1_000, { inputHint: 'expectingInput' }))
    );
    await context.step('click while will start', () => ui.micClick());
    await context.step('speech ends', () => ui.speakEnd('b1'));
  },

  // Posts.
  'a card action in each dictate state': inEachDictateState(context => components(context).cardAction('a')),
  'a typed message in each dictate state': inEachDictateState(context => context.driver.ops.sendMessage('typed')),
  'a spoken message in each dictate state': inEachDictateState(context =>
    context.driver.ops.sendMessage('spoken', 'speech')
  ),
  'an event and a typing in each dictate state': inEachDictateState(context => {
    context.driver.ops.sendEvent('e', 1);
    context.driver.ops.emitTypingIndicator();
  }),
  'submit spoken and typed in each dictate state': inEachDictateState(context => {
    context.driver.ops.setSendBox('spoken');
    context.driver.ops.submitSendBox('speech');
    context.driver.ops.setSendBox('typed');
    context.driver.ops.submitSendBox();
  }),
  'quirk: a card action while will start cancels the auto start': async context => {
    const mock = await connectOnline(context);
    const ui = components(context);

    await context.step('speak incoming', () => context.driver.ops.startSpeakingActivity());
    await context.step('expecting, spoken', () =>
      mock.emitActivity(
        botMessage('b1', 1_000, { inputHint: 'expectingInput', suggestedActions: { actions: ACTIONS, to: [] } })
      )
    );
    await context.step('card action', () => ui.cardAction('a'));
    await context.step('speech ends', () => ui.speakEnd('b1'));
    await context.step('return, echo', () => sendAll(mock));
  },
  'continuous: posts while dictating are spoken, the dictation goes on': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;
    const ui = components(context);

    await context.step('start', () => ops.startDictate());
    await context.step('progress', () => ui.progress(['a']));
    await context.step('recognized', () => ui.recognize('a'));
    await context.step('typed while dictating', () => ops.sendMessage('typed'));
    await context.step('return, echo', () => sendAll(mock));
    await context.step('bot', () => mock.emitActivity(botMessage('b1', 1_000, { inputHint: 'expectingInput' })));
    await context.step('progress again', () => ui.progress(['b']));
    await context.step('recognized again', () => ui.recognize('b'));
    await context.step('ignoring', () => mock.emitActivity(botMessage('b2', 2_000, { inputHint: 'ignoringInput' })));
  },
  'rotation: a spoken message while starting, before and after a non-message post': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('starting, spoken message', () => {
      ops.startDictate();
      ops.sendMessage('one', 'speech');
    });
    await context.step('stop speaking, event', () => {
      ops.stopSpeakingActivity();
      ops.sendEvent('e');
    });
    await context.step('starting, spoken message again', () => {
      ops.startDictate();
      ops.sendMessage('two', 'speech');
    });
    await context.step('reconnecting', () => mock.emitStatus(1));
    await context.step('reconnected', () => mock.emitStatus(2));
    await context.step('stop speaking, starting, spoken message after reconnect', () => {
      ops.stopSpeakingActivity();
      ops.startDictate();
      ops.sendMessage('three', 'speech');
    });
  },

  'rotation: typing on from the start, then on again while online, then interims': async context => {
    const mock = context.createDirectLine(DIRECT_LINE);
    const { ops } = context.driver;

    await context.step('typing indicator on', () => ops.setSendTypingIndicator(true));
    await context.step('connect', () => context.driver.connect({ directLine: mock.directLine, userID: 'u-1' }));
    await context.step('online', () => mock.emitStatus(2));

    const speakExpecting = (id: string, timestamp: number) => () => {
      ops.startSpeakingActivity();
      mock.emitActivity(botMessage(id, timestamp, { inputHint: 'expectingInput' }));
    };

    await context.step('spoken, expecting', speakExpecting('b1', 1_000));
    await context.step('type', () => ops.setSendBox('a'));
    await context.step('typing off, on', () => {
      ops.setSendTypingIndicator(false);
      ops.setSendTypingIndicator(true);
    });
    await context.step('idle, spoken, expecting', () => {
      ops.setDictateState(IDLE);
      speakExpecting('b2', 2_000)();
    });
    await context.step('t=3000, type', () => {
      context.clock.tick(3_000);
      ops.setSendBox('ab');
    });
    await context.step('idle, interims', () => {
      ops.setDictateState(IDLE);
      ops.setDictateInterims([]);
    });
    await context.step('spoken, expecting again', speakExpecting('b3', 3_000));
    await context.step('t=6000, type', () => {
      context.clock.tick(3_000);
      ops.setSendBox('abc');
    });
    await context.step('idle, typing off, on, a post', () => {
      ops.setDictateState(IDLE);
      ops.setSendTypingIndicator(false);
      ops.setSendTypingIndicator(true);
      ops.sendMessage('posted');
    });
    await context.step('spoken, expecting once more', speakExpecting('b4', 4_000));
    await context.step('t=9000, type', () => {
      context.clock.tick(3_000);
      ops.setSendBox('abcd');
    });
  },

  // Offline.
  'quirk: offline, nothing is spoken, inputs do not stop the speech, marks start': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;
    const ui = components(context);

    await context.step('speak incoming', () => ops.startSpeakingActivity());
    await context.step('expecting, spoken', () =>
      mock.emitActivity(botMessage('b1', 1_000, { inputHint: 'expectingInput' }))
    );
    await context.step('disconnect', () => context.driver.disconnect());
    await context.step('type', () => ops.setSendBox('a'));
    await context.step('interims', () => ops.setDictateInterims(['x']));
    await context.step('post', () => ops.sendMessage('x', 'speech'));
    await context.step('speech ends', () => ui.speakEnd('b1'));
    await context.step('will start, stop speaking, start speaking', () => {
      ops.setDictateState(WILL_START);
      ops.startSpeakingActivity();
    });
    await context.step('connect again', () => context.driver.connect({ directLine: mock.directLine, userID: 'u-1' }));
  },
  'quirk: while reconnecting, nothing is spoken; stopping the speech still marks': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('speak incoming', () => ops.startSpeakingActivity());
    await context.step('spoken', () => mock.emitActivity(botMessage('b1', 1_000)));
    await context.step('reconnecting', () => mock.emitStatus(1));
    await context.step('incoming while reconnecting', () =>
      mock.emitActivity(botMessage('b2', 2_000, { inputHint: 'expectingInput' }))
    );
    await context.step('type', () => ops.setSendBox('a'));
    await context.step('stop speaking', () => ops.stopSpeakingActivity());
    await context.step('reconnected', () => mock.emitStatus(2));
    await context.step('speak incoming, expecting', () => {
      ops.startSpeakingActivity();
      mock.emitActivity(botMessage('b3', 3_000, { inputHint: 'expectingInput' }));
    });
  },
  'quirk: should speak survives a disconnect': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    await context.step('speak incoming', () => ops.startSpeakingActivity());
    await context.step('disconnect', () => context.driver.disconnect());
    await context.step('connect again', () => context.driver.connect({ directLine: mock.directLine, userID: 'u-1' }));
    await context.step('online again', () => mock.emitStatus(2));
    await context.step('spoken', () => mock.emitActivity(botMessage('b1', 1_000, { inputHint: 'expectingInput' })));
  },
  'every operation before connecting': async context => {
    const { ops } = context.driver;
    const ui = components(context);

    await context.step('speak incoming', () => ops.startSpeakingActivity());
    await context.step('dictate', () => {
      ops.startDictate();
      ops.setDictateState(DICTATING);
      ops.setDictateInterims(['a']);
    });
    await context.step('click', () => ui.micClick());
    await context.step('will start', () => ops.setDictateState(WILL_START));
    await context.step('stop speaking', () => ops.stopSpeakingActivity());
    await context.step('stop dictate', () => ops.stopDictate());
    await context.step('start dictate twice', () => {
      ops.startDictate();
      ops.startDictate();
    });
    await context.step('stop dictate twice', () => {
      ops.stopDictate();
      ops.stopDictate();
    });
  },
  'dictation ends or fails in each dictate state': async context => {
    await connectOnline(context);
    const { ops } = context.driver;
    const ui = components(context);

    await forEachDictateState((name, value) =>
      context.step(`${name}: ends`, () => {
        ops.setDictateState(value);
        ui.dictationEnd();
      })
    );
  },
  'the dictate state machine: start and stop from each state': async context => {
    await connectOnline(context);
    const { ops } = context.driver;

    await forEachDictateState(async (name, value) => {
      await context.step(`${name}: start`, () => {
        ops.setDictateState(value);
        ops.startDictate();
      });
      await context.step(`${name}: stop`, () => {
        ops.setDictateState(value);
        ops.stopDictate();
      });
    });
  },
  'a fatal error, then the speech operations': async context => {
    const mock = await connectOnline(context);
    const { ops } = context.driver;

    context.faults.receiveThrowsFor = 'b9';

    await context.step('speak incoming', () => ops.startSpeakingActivity());
    await context.step('spoken', () => mock.emitActivity(botMessage('b1', 1_000, { inputHint: 'expectingInput' })));
    await context.step('fatal', () => mock.emitActivity(botMessage('b9', 9_000)));
    await context.step('speech ends', () => ops.markActivity({ id: 'b1' }, 'speak', false));
    await context.step('will start', () => ops.setDictateState(WILL_START));
    await context.step('stop speaking', () => ops.stopSpeakingActivity());
    await context.step('interims', () => ops.setDictateInterims(['a']));
  }
});

export default speechScripts;
