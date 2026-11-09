/**
 * @jest-environment @happy-dom/jest-environment
 */
// What the speech, dictation and voice sagas do today, pinned before the services are written against them (Redux
// mode, unchanged): the order of their effects (redux-saga runs each `put()` after the current action, and a saga
// resumes after its own `put()`), the order of the sagas taking the same action (a saga that took an action waits again
// at the end of the list), what runs offline, and the quirks.
import createReduxDriver from './createReduxDriver';
import outgoingScripts from './outgoingScripts';
import runParityScript, { type StepRecord } from './runParityScript';
import speechScripts from './speechScripts';
import voiceScripts from './voiceScripts';

const scripts = { ...speechScripts, ...voiceScripts };

// An activity as its ID (or type), with "+" if it is to be spoken (`channelData.speak` true), "-" if it was spoken.
function describeActivity({ channelData, id, type }: any): string {
  const speak = channelData?.speak;

  return `${id || type}${speak === true ? '+' : speak === false ? '-' : ''}`;
}

// The order of changes, each with its value; the activities as the last one changed.
function describeOrder({ changes, order }: StepRecord): string[] {
  const counts: Record<string, number> = {};

  return order.map(key => {
    // eslint-disable-next-line security/detect-object-injection
    const values = changes[key];

    if (!values) {
      return key;
    }

    // eslint-disable-next-line security/detect-object-injection
    const value = values[(counts[key] = (counts[key] || 0) + 1) - 1];

    return key === 'activities'
      ? `activities:${(value as any[]).map(describeActivity).join(',')}`
      : key === 'notifications'
        ? key
        : `${key}=${JSON.stringify(value)}`;
  });
}

function summarize(records: readonly StepRecord[]): Record<string, string[]> {
  return Object.fromEntries(records.map(record => [record.label, describeOrder(record)]));
}

const run = (name: string) =>
  // eslint-disable-next-line security/detect-object-injection
  runParityScript(createReduxDriver, scripts[name], { speech: true });

const POST = (n: number) => [`dl1.postActivity#${n}`, `dl1.post#${n}.subscribe#1`];

describe('the parity harness', () => {
  test.each(Object.keys(scripts))('%s: the same on every run', async name => {
    expect(await run(name)).toEqual(await run(name));
  });

  test('with "speech" false, the values of speech and voice are not recorded', async () => {
    const [record] = (
      await runParityScript(createReduxDriver, speechScripts['inputHint: expecting, spoken'], { speech: false })
    ).slice(-2);

    expect(Object.keys(record.state)).not.toContain('dictateState');
    expect(record.order).not.toContain('dictateState');
  });
});

describe('the sagas, pinned', () => {
  test('a spoken bot message expecting input: marked, then its suggested actions (unmarked), then will start', async () => {
    const records = await run(
      'expecting input with suggested actions: marked, then suggested actions, then will start'
    );
    const summary = summarize(records);

    expect(summary['bot message']).toEqual(['activities:b1', 'activities:b1+', 'suggestedActions', 'dictateState=1']);
    // The origin of the suggested actions was picked before the mark: not marked.
    expect(records.find(({ label }) => label === 'bot message').suggestedActions).toEqual([
      { actions: [{ title: 'A', type: 'imBack', value: 'a' }], origin: 'b1' }
    ]);
    // The end of the speech marks it, then the dictation starts.
    expect(summary['speech ends']).toEqual(['activities:b1-', 'dictateState=2']);
  });

  test('the input hints: expecting starts after the speech, ignoring stops, accepting and none do nothing', async () => {
    expect(summarize(await run('inputHint: expecting, spoken'))['speech ends']).toEqual([
      'activities:b1-',
      'dictateState=2'
    ]);
    expect(summarize(await run('inputHint: expecting, not spoken'))['bot message']).toEqual([
      'activities:b1',
      'suggestedActions'
    ]);
    expect(summarize(await run('inputHint: accepting, spoken'))['speech ends']).toEqual(['activities:b1-']);
  });

  test('quirk: ignoring input stops the dictation even when not speaking (queued before the suggested actions)', async () => {
    expect(
      summarize(await run('quirk: ignoring input stops the dictation, also when not spoken'))['ignoring, not spoken']
    ).toEqual(['activities:b1', 'dictateState=4', 'suggestedActions']);
  });

  test('2 spoken messages released together: each one received, marked, its suggested actions, then the next', async () => {
    expect(summarize(await run('a reply held, then released with its target'))['then its target']).toEqual([
      'activities:b0,b1',
      'activities:b0,b1+',
      'suggestedActions',
      'activities:b0,b1+,b2',
      'activities:b0,b1+,b2+',
      'suggestedActions',
      'dictateState=1'
    ]);
  });

  test('stop speaking: one mark per spoken activity, each re-checking the auto start; then the dictation starts', async () => {
    expect(
      summarize(await run('stop speaking: marks every spoken activity, then starts the dictation'))['stop speaking']
    ).toEqual([
      'shouldSpeakIncomingActivity=false',
      'activities:b1-,b2+,b3+',
      'activities:b1-,b2-,b3+',
      'activities:b1-,b2-,b3-',
      'dictateState=2'
    ]);
  });

  test('quirk: typing through the hook while will start starts the dictation', async () => {
    expect(
      summarize(
        await run('quirk: typing through the hook while will start starts the microphone; the text box does not')
      )['set send box (hook)']
    ).toEqual(['sendBoxValue="a"', 'shouldSpeakIncomingActivity=false', 'activities:b1-', 'dictateState=2']);
  });

  test('quirk: a card action while will start cancels the auto start; the clear comes first', async () => {
    const summary = summarize(await run('quirk: a card action while will start cancels the auto start'));

    expect(summary['card action']).toEqual([
      'dictateState=0',
      'activities:b1+,message',
      ...POST(1),
      'suggestedActions',
      'shouldSpeakIncomingActivity=false',
      'activities:b1-,message'
    ]);
  });

  test('order of the sagas taking a pending post: after a post that is not a message, stop dictate comes first', async () => {
    const summary = summarize(
      await run('rotation: a spoken message while starting, before and after a non-message post')
    );
    const speech = (label: string) =>
      // eslint-disable-next-line security/detect-object-injection
      summary[label].filter(entry => /^(dictateState|shouldSpeakIncomingActivity)/u.test(entry));

    expect(speech('starting, spoken message')).toEqual([
      'dictateState=2',
      'shouldSpeakIncomingActivity=true',
      'dictateState=4'
    ]);
    expect(speech('starting, spoken message again')).toEqual([
      'dictateState=2',
      'dictateState=4',
      'shouldSpeakIncomingActivity=true'
    ]);
    // Online again, the sagas wait in the order they were started.
    expect(speech('stop speaking, starting, spoken message after reconnect')).toEqual([
      'shouldSpeakIncomingActivity=false',
      'dictateState=2',
      'shouldSpeakIncomingActivity=true',
      'dictateState=4'
    ]);
  });

  test('order of the sagas taking a send box value: the typing indicator first, unless enabled while online', async () => {
    const summary = summarize(
      await run('rotation: typing on from the start, then on again while online, then interims')
    );
    const typingFirst = (label: string) => {
      // eslint-disable-next-line security/detect-object-injection
      const entries = summary[label];

      return entries.findIndex(entry => /typing$/u.test(entry)) < entries.indexOf('dictateState=2');
    };

    // On when online: the typing indicator saga started before the speech sagas.
    expect(typingFirst('type')).toBe(true);
    // On again: it waits at the end, after the speech saga taking the value.
    expect(typingFirst('t=3000, type')).toBe(false);
    // Interims: the speech saga took them, and waits at the end again.
    expect(typingFirst('t=6000, type')).toBe(true);
    // On again, then a post: pending moves the speech saga to the end.
    expect(typingFirst('t=9000, type')).toBe(true);
  });

  test('quirk: offline, inputs and posts do not stop the speech, and nothing is spoken; marks still start', async () => {
    const summary = summarize(
      await run('quirk: offline, nothing is spoken, inputs do not stop the speech, marks start')
    );

    expect(summary.type).toEqual(['sendBoxValue="a"']);
    expect(summary.interims).toEqual(['dictateInterims=["x"]']);
    expect(summary.post).toEqual([]);
    expect(summary['speech ends']).toEqual(['activities:b1-', 'dictateState=2']);

    const reconnecting = summarize(
      await run('quirk: while reconnecting, nothing is spoken; stopping the speech still marks')
    );

    expect(reconnecting['incoming while reconnecting']).toEqual([]);
    expect(reconnecting['stop speaking']).toEqual(['shouldSpeakIncomingActivity=false', 'activities:b1-']);
  });

  test('quirk: should speak survives a disconnect', async () => {
    expect(summarize(await run('quirk: should speak survives a disconnect')).spoken).toEqual([
      'activities:b1',
      'activities:b1+',
      'suggestedActions',
      'dictateState=1'
    ]);
  });

  test('quirk: a spoken message with an attachment of content null stops everything; after, marks only write', async () => {
    const records = await run(
      'quirk: an attachment with content null on a spoken message without text stops everything'
    );
    const summary = summarize(records);

    expect(summary['attachment with content null']).toEqual([
      'activities:b1+,b2',
      'connectivityStatus="sagaerror"',
      'notifications'
    ]);
    expect(records.find(({ label }) => label === 'attachment with content null').console).toEqual([
      "error: Error(Cannot read properties of null (reading 'speak'))"
    ]);
    // No saga: stopping the speech marks nothing, the end of the speech does not start the dictation.
    expect(summary['stop speaking']).toEqual(['shouldSpeakIncomingActivity=false']);
    expect(summary['speech ends']).toEqual(['activities:b1-,b2']);
    expect(summary['will start, again']).toEqual([]);
  });

  test('quirk: any mark re-checks the auto start; a reserved name throws to the caller', async () => {
    const summary = summarize(await run('quirk: any mark re-checks the auto start (a "read" mark while will start)'));

    expect(summary['read mark of b1']).toEqual(['activities:b1,b2+']);
    expect(summary['mark b2 spoken']).toEqual(['activities:b1,b2-', 'dictateState=2']);

    const reserved = await run('mark: a reserved name throws to the caller, nothing else happens');

    expect(reserved.find(({ label }) => label === 'reserved name')).toMatchObject({ order: [] });
    expect(reserved.find(({ label }) => label === 'reserved name').console).toHaveLength(1);
  });

  test('set dictate state: the auto start runs on every set', async () => {
    const summary = summarize(await run('dictate state set: the auto start runs also when unchanged'));

    expect(summary['will start']).toEqual(['dictateState=1', 'dictateState=2']);
    expect(summary['starting again, unchanged']).toEqual([]);
    expect(summary['will start, twice']).toEqual([
      'dictateState=1',
      'dictateState=2',
      'dictateState=1',
      'dictateState=2'
    ]);
    // Unchanged, it still checks: the activity to speak was replaced (by one of the user, with the same ID).
    expect(
      summarize(
        await run('quirk: an unchanged will start starts, once the activity to speak is replaced without a mark')
      )['will start, unchanged']
    ).toEqual(['dictateState=2']);
  });
});

describe('the voice saga and reducer, pinned', () => {
  test('quirk: start when not idle warns and starts; mute is reset by start and stop', async () => {
    const records = await run('quirk: start when not idle warns, and starts; mute is reset by start and stop');

    expect(records.find(({ label }) => label === 'processing, start').console).toEqual([
      'warn: botframework-webchat: Should not transit from "processing" to "listening"'
    ]);
    expect(summarize(records)['start while muted and idle']).toEqual([
      'microphoneMuted=false',
      'voiceState="listening"'
    ]);
  });

  test('quirk: every register and unregister makes new handlers, also when nothing changes', async () => {
    const summary = summarize(await run('quirk: every register and unregister makes new handlers'));

    expect(summary['register h1 again']).toEqual(['voiceHandlers=["h1","h2","h1"]']);
    expect(summary['unregister it again']).toEqual(['voiceHandlers=["h2","h1"]']);
  });

  test('voice activities: dropped while idle; detected stops the audio before the state changes', async () => {
    const summary = summarize(await run('voice activities: idle, listening, detected, processing'));

    expect(summary['chunk while idle']).toEqual([]);
    expect(summary.chunk).toEqual(['h1.queueAudio(BBBB)', 'h2.queueAudio(BBBB)']);
    expect(summary['detected: audio stops, then user speaking']).toEqual([
      'h1.stopAllAudio()',
      'h2.stopAllAudio()',
      'voiceState="user_speaking"'
    ]);
  });

  test('voice posts: the fields; fire and forget; an event keeps its value key', async () => {
    const records = await run('voice post: the fields, fire and forget');
    const posted = records.flatMap(({ posted }) => posted) as any[];

    expect(posted[0]).toEqual({
      channelId: 'webchat',
      from: { id: 'u-1', name: 'User', role: 'user' },
      locale: 'fr-FR',
      localTimestamp: '1969-12-31T16:00:00.000-08:00',
      localTimezone: expect.any(String),
      name: 'media.chunk',
      type: 'event',
      value: { content: 'AAAA', contentType: 'audio/webm', timestamp: 't' }
    });
    expect(posted[1]).toMatchObject({ from: { id: 'u-1', name: 'User', role: 'user' }, id: 'm1', type: 'message' });
    expect(posted[2]).toHaveProperty('value', undefined);
    expect('value' in posted[2]).toBe(true);
    // No "sending": the voice activities are not in the transcript.
    expect(records.every(({ changes }) => !changes.activities)).toBe(true);
  });

  test('quirk: voice posts offline are dropped; in flight, unsubscribed without an error; not the first post', async () => {
    const records = await run('quirk: voice posts offline are dropped; in flight, unsubscribed silently');
    const byLabel = (label: string) => records.find(record => record.label === label);

    expect(byLabel('before connect').calls).toEqual([]);
    expect(byLabel('while reconnecting').calls).toEqual([]);
    expect(byLabel('reconnecting').calls).toContain('dl1.post#2.unsubscribe#1');
    expect(byLabel('the other errors after').console).toEqual([]);

    const notFirst = await run('quirk: a voice post is not the first post');
    const [voice, message] = notFirst.flatMap(({ posted }) => posted) as any[];

    expect(voice).not.toHaveProperty('entities');
    expect(message.entities).toEqual([expect.objectContaining({ type: 'ClientCapabilities' })]);
  });

  test('voice posts: an error is logged', async () => {
    const records = await run('voice post: an error is logged');

    expect(records.find(({ label }) => label === 'error').console).toEqual([
      'error: botframework-webchat: Failed to post voice activity to chat adapter. Error(boom)'
    ]);
  });
});

describe('the outgoing saga, pinned', () => {
  test('an echo inside subscribe() is not missed: activities are handled a microtask later', async () => {
    const records = await runParityScript(
      createReduxDriver,
      outgoingScripts['the post echoes inside subscribe(): the echo is not missed']
    );

    expect(records.find(({ label }) => label === 'returns').state.activities).toEqual([
      expect.objectContaining({ channelData: expect.objectContaining({ 'webchat:send-status': 'sent' }) })
    ]);
  });
});
