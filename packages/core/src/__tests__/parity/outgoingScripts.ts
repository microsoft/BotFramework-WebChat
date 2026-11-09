/* eslint-disable no-magic-numbers, no-restricted-globals */
// The scripts of the outgoing parity spec: posting an activity (`postActivitySaga`), from pending to sent or send
// failed: the echo, the return of `postActivity()`, the send timeouts, errors, going offline, the fields of the activity
// posted, and the faults.
import type { MockDirectLine, MockDirectLineInit } from './createMockDirectLine';
import type { Script, ScriptContext } from './runParityScript';

const DIRECT_LINE: MockDirectLineInit = Object.freeze({ name: 'dl1', replayStatus: true });

const BOT = Object.freeze({ id: 'bot', role: 'bot' });

function message(text: string, extra: Record<string, unknown> = {}) {
  return { text, type: 'message', ...extra };
}

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

/** Posts, then the service returns the ID and echoes the activity back. */
async function postAndSend(context: ScriptContext, mock: MockDirectLine, text: string): Promise<void> {
  await context.step(`post "${text}"`, () => context.driver.ops.postActivity(message(text)));

  const n = mock.postCount();

  await context.step(`"${text}" returns and echoes`, () => {
    mock.post(n).next();
    mock.post(n).complete();
    mock.post(n).echo();
  });
}

const outgoingScripts: Readonly<Record<string, Script>> = Object.freeze({
  // When the post is fulfilled.
  'echo after the post returns': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('returns', () => mock.post(1).next());
    await context.step('completes', () => mock.post(1).complete());
    await context.step('echo', () => mock.post(1).echo());
    await context.step('t=300000', () => context.clock.tick(300_000));
  },
  'echo before the post returns': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('echo', () => mock.post(1).echo());
    await context.step('returns', () => mock.post(1).next());
    await context.step('completes', () => mock.post(1).complete());
  },
  'echo and return in one turn': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('echo, returns', () => {
      mock.post(1).echo();
      mock.post(1).next();
    });
    await context.step('post again', () => context.driver.ops.postActivity(message('again')));
    await context.step('returns, echo', () => {
      mock.post(2).next();
      mock.post(2).echo();
    });
  },
  'the post returns when subscribed': async context => {
    const mock = await connectOnline(context, { ...DIRECT_LINE, postReturnsOnSubscribe: true });

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('echo', () => mock.post(1).echo());
  },
  'the post completes without a value': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('completes', () => mock.post(1).complete());
    await context.step('echo', () => mock.post(1).echo());
  },
  'post, echo and return in one turn': async context => {
    const mock = await connectOnline(context, { ...DIRECT_LINE, postReturnsOnSubscribe: true });

    await context.step('post, echo', () => {
      context.driver.ops.postActivity(message('hello'));
      mock.post(1).echo();
    });
  },

  // Send timeouts.
  'no echo: impeded at 20 s, echo at 25 s, sent': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('returns', () => mock.post(1).next());
    await context.step('t=19999', () => context.clock.tick(19_999));
    await context.step('t=20000', () => context.clock.tick(1));
    await context.step('t=25000, echo', () => {
      context.clock.tick(5_000);
      mock.post(1).echo();
    });
    await context.step('t=300000', () => context.clock.tick(275_000));
  },
  'no echo: impeded at 20 s, rejected at 300 s': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('returns', () => mock.post(1).next());
    await context.step('t=20000', () => context.clock.tick(20_000));
    await context.step('t=299999', () => context.clock.tick(279_999));
    await context.step('t=300000', () => context.clock.tick(1));
    await context.step('echo after', () => mock.post(1).echo());
  },
  'echo, the post never returns: rejected at 300 s': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('echo', () => mock.post(1).echo());
    await context.step('t=20000', () => context.clock.tick(20_000));
    await context.step('t=300000', () => context.clock.tick(280_000));
    await context.step('returns after', () => mock.post(1).next());
  },
  'neither echo nor return: rejected at 300 s': async context => {
    await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('t=20000', () => context.clock.tick(20_000));
    await context.step('t=300000', () => context.clock.tick(280_000));
  },
  'send timeout of 5 s': async context => {
    const mock = await connectOnline(context);

    await context.step('setSendTimeout(5000)', () => context.driver.ops.setSendTimeout(5_000));
    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('returns', () => mock.post(1).next());
    await context.step('t=5000', () => context.clock.tick(5_000));
    await context.step('t=300000', () => context.clock.tick(295_000));
  },
  'send timeout above 300 s': async context => {
    const mock = await connectOnline(context);

    await context.step('setSendTimeout(400000)', () => context.driver.ops.setSendTimeout(400_000));
    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('returns', () => mock.post(1).next());
    await context.step('t=300000', () => context.clock.tick(300_000));
    await context.step('t=400000', () => context.clock.tick(100_000));
  },
  'send timeout changed while posting': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('first')));
    await context.step('setSendTimeout(5000)', () => context.driver.ops.setSendTimeout(5_000));
    await context.step('post again', () => context.driver.ops.postActivity(message('second')));
    await context.step('both return', () => {
      mock.post(1).next();
      mock.post(2).next();
    });
    await context.step('t=5000', () => context.clock.tick(5_000));
    await context.step('t=20000', () => context.clock.tick(15_000));
    await context.step('both echo', () => {
      mock.post(2).echo();
      mock.post(1).echo();
    });
  },
  'send timeouts in one tick of the clock': async context => {
    await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    // The hard timeout starts when the send timeout is handled, after the tick: not at 300 s.
    await context.step('t=300000 in one tick', () => context.clock.tick(300_000));
    await context.step('t=579999', () => context.clock.tick(279_999));
    await context.step('t=580000', () => context.clock.tick(1));
  },
  'returns in the same turn as the send timeout': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('echo', () => mock.post(1).echo());
    await context.step('t=20000, returns', () => {
      context.clock.tick(20_000);
      mock.post(1).next();
    });
    await context.step('post again', () => context.driver.ops.postActivity(message('again')));
    await context.step('t=320000, echo, returns', () => {
      context.clock.tick(20_000);
      context.clock.tick(280_000);
      mock.post(2).echo();
      mock.post(2).next();
    });
  },
  'send timeout set before connect': async context => {
    context.driver.ops.setSendTimeout(1_000);

    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('t=1000', () => context.clock.tick(1_000));
    await context.step('echo, returns', () => {
      mock.post(1).echo();
      mock.post(1).next();
    });
  },

  // Errors.
  'the post errors': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('errors', () => mock.post(1).error(new Error('network')));
    await context.step('echo after', () => mock.post(1).echo());
    await context.step('t=300000', () => context.clock.tick(300_000));
  },
  'the post errors after the echo': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('echo', () => mock.post(1).echo());
    await context.step('errors', () => mock.post(1).error(new Error('network')));
  },
  'postActivity() throws': async context => {
    const mock = await connectOnline(context);

    await context.step('post that throws', () => {
      mock.setPostThrows(true);
      context.driver.ops.postActivity(message('hello'));
    });
    await context.step('post again', () => {
      mock.setPostThrows(false);
      context.driver.ops.postActivity(message('again'));
    });
    await context.step('returns, echo', () => {
      mock.post(2).next();
      mock.post(2).echo();
    });
  },
  'retry the failed activity': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('errors', () => mock.post(1).error(new Error('network')));
    await context.step('post the failed activity again', () =>
      context.driver.ops.postActivity(context.driver.observe().activities.at(-1))
    );
    await context.step('returns, echo', () => {
      mock.post(2).next();
      mock.post(2).echo();
    });
  },

  // Offline.
  'disconnect with 2 posts in flight': async context => {
    const mock = await connectOnline(context);

    await context.step('post 2', () => {
      context.driver.ops.postActivity(message('first'));
      context.driver.ops.postActivity(message('second'));
    });
    await context.step('the second returns', () => mock.post(2).next());
    await context.step('disconnect', () => context.driver.disconnect());
    await context.step('echo after', () => mock.post(1).echo());
    await context.step('t=300000', () => context.clock.tick(300_000));
  },
  'reconnect with a post in flight, echo after': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('reconnecting', () => mock.emitStatus(1));
    await context.step('reconnected', () => mock.emitStatus(2));
    await context.step('echo, returns', () => {
      mock.post(1).echo();
      mock.post(1).next();
    });
  },
  'Direct Line fails with a post in flight': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('status 4', () => mock.emitStatus(4));
  },
  'post before connect, while connecting, reconnecting and after disconnect: dropped': async context => {
    const mock = context.createDirectLine(DIRECT_LINE);

    await context.step('post before connect', () => context.driver.ops.postActivity(message('before')));
    await context.step('connect', () =>
      context.driver.connect({ directLine: mock.directLine, userID: 'u-1', username: 'User' })
    );
    await context.step('post while connecting', () => context.driver.ops.postActivity(message('connecting')));
    await context.step('online', () => mock.emitStatus(2));
    await context.step('reconnecting', () => mock.emitStatus(1));
    await context.step('post while reconnecting', () => context.driver.ops.postActivity(message('reconnecting')));
    await context.step('reconnected', () => mock.emitStatus(2));
    await postAndSend(context, mock, 'online');
    await context.step('disconnect', () => context.driver.disconnect());
    await context.step('post after disconnect', () => context.driver.ops.postActivity(message('after')));
  },
  'post and go offline in one turn': async context => {
    const mock = await connectOnline(context);

    await context.step('post, reconnecting', () => {
      context.driver.ops.postActivity(message('hello'));
      mock.emitStatus(1);
    });
    await context.step('reconnected, post', () => {
      mock.emitStatus(2);
      context.driver.ops.postActivity(message('again'));
    });
  },

  // Client capabilities.
  'ClientCapabilities on the first post only': async context => {
    const mock = await connectOnline(context);

    await postAndSend(context, mock, 'first');
    await postAndSend(context, mock, 'second');
  },
  'ClientCapabilities again after reconnect': async context => {
    const mock = await connectOnline(context);

    await postAndSend(context, mock, 'first');
    await context.step('reconnecting', () => mock.emitStatus(1));
    await context.step('reconnected', () => mock.emitStatus(2));
    await postAndSend(context, mock, 'after reconnect');
  },
  'ClientCapabilities on a typing activity first': async context => {
    const mock = await connectOnline(context);

    await context.step('emit typing', () => context.driver.ops.emitTypingIndicator());
    await context.step('typing returns', () => mock.post(1).next());
    await postAndSend(context, mock, 'message');
  },
  'ClientCapabilities on a failed post': async context => {
    const mock = await connectOnline(context);

    await context.step('post that throws', () => {
      mock.setPostThrows(true);
      context.driver.ops.postActivity(message('throws'));
    });

    mock.setPostThrows(false);

    await postAndSend(context, mock, 'second');
  },

  // Echoes.
  '2 posts echoed in reverse order': async context => {
    const mock = await connectOnline(context);

    await context.step('post 2', () => {
      context.driver.ops.postActivity(message('first'));
      context.driver.ops.postActivity(message('second'));
    });
    await context.step('both return', () => {
      mock.post(1).next();
      mock.post(2).next();
    });
    await context.step('echo the second', () => mock.post(2).echo());
    await context.step('echo the first', () => mock.post(1).echo());
  },
  'an echo without ID is not the echo': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('returns', () => mock.post(1).next());
    await context.step('echo without ID', () => mock.post(1).echo({ id: undefined }));
    await context.step('echo with ID', () => mock.post(1).echo());
  },
  'an echo of another client activity ID': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('returns', () => mock.post(1).next());
    await context.step('echo with another client activity ID', () =>
      mock.post(1).echo({ channelData: { clientActivityID: 'other' }, id: 'x1' })
    );
    await context.step('t=20000', () => context.clock.tick(20_000));
    await context.step('echo', () => mock.post(1).echo());
  },
  'an echo held by the reply hold': async context => {
    const mock = await connectOnline(context);

    await context.step('bot message', () => mock.emitActivity(botMessage('b1', 0)));
    await context.step('post a reply to a missing activity', () =>
      context.driver.ops.postActivity(message('reply', { replyToId: 'missing' }))
    );
    await context.step('returns, echo', () => {
      mock.post(1).next();
      mock.post(1).echo();
    });
    await context.step('t=5000', () => context.clock.tick(5_000));
  },
  'an echo released by its reply target': async context => {
    const mock = await connectOnline(context);

    await context.step('bot message', () => mock.emitActivity(botMessage('b1', 0)));
    await context.step('post a reply to b2', () =>
      context.driver.ops.postActivity(message('reply', { replyToId: 'b2' }))
    );
    await context.step('returns, echo', () => {
      mock.post(1).next();
      mock.post(1).echo();
    });
    await context.step('b2', () => mock.emitActivity(botMessage('b2', 500)));
  },
  'a bot reply in the same turn as the echo': async context => {
    const mock = await connectOnline(context);
    const actions = [{ title: 'A', type: 'imBack', value: 'a' }];

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('returns', () => mock.post(1).next());
    await context.step('echo, bot reply with suggested actions', () => {
      mock.post(1).echo();
      mock.emitActivity(botMessage('b1', 2_000, { suggestedActions: { actions } }));
    });
  },

  // The activity posted.
  'fields: strips the local fields': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () =>
      context.driver.ops.postActivity(
        {
          attachments: [
            {
              content: { body: [] },
              contentType: 'application/vnd.microsoft.card.adaptive',
              contentUrl: 'https://example.com/a',
              name: 'a',
              thumbnailUrl: 'https://example.com/t'
            }
          ],
          channelData: {
            clientActivityID: 'old',
            custom: 1,
            state: 'sent',
            'webchat:internal:local-id': 'local',
            'webchat:internal:position': 3,
            'webchat:send-status': 'sent'
          },
          entities: [{ type: 'other' }],
          from: { id: 'someone', role: 'bot' },
          id: 'old-id',
          localTimestamp: 'x',
          replyToId: 'r',
          suggestedActions: { actions: [] },
          text: 'hello',
          type: 'message',
          value: { a: 1 }
        },
        'code'
      )
    );
    await context.step('returns, echo', () => {
      mock.post(1).next();
      mock.post(1).echo();
    });
  },
  'fields: event, typing, other types': async context => {
    const mock = await connectOnline(context);

    await context.step('event', () =>
      context.driver.ops.postActivity({ attachments: [{}], name: 'ev', text: 'kept', type: 'event', value: { a: 1 } })
    );
    await context.step('typing', () => context.driver.ops.postActivity({ text: 't', type: 'typing' }));
    await context.step('invoke', () => context.driver.ops.postActivity({ name: 'inv', type: 'invoke', value: 1 }));
    await context.step('no channelData, message without attachments', () =>
      context.driver.ops.postActivity({ type: 'message' })
    );
    await context.step('all return and echo', () => {
      for (let n = 1; n <= 4; n++) {
        mock.post(n).next();
        mock.post(n).echo();
      }
    });
  },
  'fields: locale and timestamps': async context => {
    const mock = await connectOnline(context);

    await context.step('t=1234, post', () => {
      context.clock.tick(1_234);
      context.driver.ops.postActivity(message('default locale'));
    });
    await context.step('setLanguage(fr-FR), post', () => {
      context.driver.ops.setLanguage('fr-FR');
      context.driver.ops.postActivity(message('fr'));
    });
    await context.step('both return and echo', () => {
      mock.post(1).next();
      mock.post(1).echo();
      mock.post(2).next();
      mock.post(2).echo();
    });
  },
  'fields: the user of the session': async context => {
    const mock = context.createDirectLine(DIRECT_LINE);

    await context.step('connect without user ID', () => context.driver.connect({ directLine: mock.directLine }));
    await context.step('online', () => mock.emitStatus(2));
    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('returns, echo', () => {
      mock.post(1).next();
      mock.post(1).echo();
    });
  },
  'fields: a frozen activity': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () =>
      context.driver.ops.postActivity(
        Object.freeze({ channelData: Object.freeze({ a: 1 }), text: 'frozen', type: 'message' })
      )
    );
    await context.step('returns, echo', () => {
      mock.post(1).next();
      mock.post(1).echo();
    });
  },

  // Faults.
  'fault: writing "sent" throws': async context => {
    context.faults.fulfilledThrowsFor = 'boom';

    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('boom')));
    await context.step('returns, echo', () => {
      mock.post(1).next();
      mock.post(1).echo();
    });
    await postAndSend(context, mock, 'after');
  },
  'fault: writing "sending" throws': async context => {
    context.faults.pendingThrowsFor = 'boom';

    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('first')));
    await context.step('post that throws', () => context.driver.ops.postActivity(message('boom')));
    await context.step('the first returns, echo', () => {
      mock.post(1).next();
      mock.post(1).echo();
    });
    await context.step('post after', () => context.driver.ops.postActivity(message('after')));
    await context.step('disconnect', () => context.driver.disconnect());
  },
  'fault: receiving the echo throws': async context => {
    context.faults.receiveThrowsFor = 'a1';

    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('hello')));
    await context.step('returns, echo', () => {
      mock.post(1).next();
      mock.post(1).echo();
    });
    await context.step('t=300000', () => context.clock.tick(300_000));
  },
  'fault: posting something that is not an activity': async context => {
    const mock = await connectOnline(context);

    await context.step('post', () => context.driver.ops.postActivity(message('first')));
    await context.step('post null', () => context.driver.ops.postActivity(null));
    await context.step('post after', () => context.driver.ops.postActivity(message('after')));
    await context.step('the first returns, echo', () => {
      mock.post(1).next();
      mock.post(1).echo();
    });
  }
});

export default outgoingScripts;
