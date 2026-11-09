/**
 * @jest-environment @happy-dom/jest-environment
 */
// What the outgoing, send box and typing sagas do today, pinned before the services are written against them (Redux
// mode, unchanged): the order of the effects of a post and of a submit, the send timeouts, going offline, the typing
// throttle (`takeLatest()`), and the quirks. Also checks that the parity harness compares what it should: the random IDs
// are normalized by rank, and a wrong link between IDs still fails.
import createReduxDriver from './createReduxDriver';
import outgoingScripts from './outgoingScripts';
import runParityScript, { normalizeRandomIDs, type StepRecord } from './runParityScript';
import sendScripts from './sendScripts';

type Summary = {
  activities?: readonly string[];
  calls?: readonly string[];
  console?: readonly string[];
  order?: readonly string[];
  timers?: readonly string[];
};

// Activities as "text:state/send-status" (the deprecated `channelData.state`, then `channelData['webchat:send-status']`).
function describeActivities(activities: readonly any[]): string {
  return activities
    .map(
      ({ channelData, text, type }) =>
        `${type === 'message' ? text : type}:${channelData?.state ?? ''}/${channelData?.['webchat:send-status'] ?? ''}`
    )
    .join(', ');
}

function summarize(records: readonly StepRecord[]): Record<string, Summary> {
  return Object.fromEntries(
    records.map(({ calls, changes, console, label, order, timers }) => {
      const summary: Summary = {};
      const postCalls = calls.filter(call => /\.(postActivity|post)#|end\(\)/u.test(call));

      changes.activities && (summary.activities = changes.activities.map(describeActivities));
      postCalls.length && (summary.calls = postCalls);
      console.length && (summary.console = console);
      order.length && (summary.order = order);
      timers.length && (summary.timers = timers);

      return [label, summary];
    })
  );
}

const run = (name: string) =>
  // eslint-disable-next-line security/detect-object-injection
  runParityScript(createReduxDriver, outgoingScripts[name] || sendScripts[name]);

const POST = (n: number, clear = true) => [
  'activities',
  `dl1.postActivity#${n}`,
  `dl1.post#${n}.subscribe#1`,
  ...(clear ? ['suggestedActions'] : [])
];

const FAILED = 'error: botframework-webchat: Failed to post activity to chat adapter.';

describe('the parity harness', () => {
  test.each(Object.keys({ ...outgoingScripts, ...sendScripts }))('%s: the same on every run', async name => {
    expect(await run(name)).toEqual(await run(name));
  });

  test('random IDs differ between runs: the normalization is needed', async () => {
    const script = outgoingScripts['echo after the post returns'];

    expect(await runParityScript(createReduxDriver, script, { raw: true })).not.toEqual(
      await runParityScript(createReduxDriver, script, { raw: true })
    );
  });

  test('normalized by rank: a relabel compares equal, a reused or swapped ID does not', async () => {
    const records = await runParityScript(createReduxDriver, outgoingScripts['2 posts echoed in reverse order'], {
      raw: true
    });
    const [first, second] = records
      .flatMap(({ posted }) => posted)
      .map((activity: any) => activity.channelData.clientActivityID);
    const json = JSON.stringify(records);
    const replace = (text: string, from: string, to: string) => text.split(from).join(to);
    const normalized = normalizeRandomIDs(records);

    // The same records with other random IDs.
    expect(normalizeRandomIDs(JSON.parse(replace(replace(json, first, 'X'), second, 'Y')))).toEqual(normalized);
    // A driver that reused the client activity ID of the first post for the second.
    expect(normalizeRandomIDs(JSON.parse(replace(json, second, first)))).not.toEqual(normalized);

    // A driver that fulfilled the wrong activity: the IDs swapped in the last step only.
    const swapped = JSON.parse(json);

    swapped[swapped.length - 1] = JSON.parse(
      replace(replace(replace(JSON.stringify(swapped.at(-1)), first, 'TEMP'), second, first), 'TEMP', second)
    );

    expect(normalizeRandomIDs(swapped)).not.toEqual(normalized);
  });
});

describe('the sagas, pinned', () => {
  test('a post: sending, then Direct Line, then the suggested actions cleared; sent when echoed and returned', async () => {
    const summary = summarize(await run('echo before the post returns'));

    expect(summary.post).toEqual({
      activities: ['hello:sending/sending'],
      calls: ['dl1.postActivity#1', 'dl1.post#1.subscribe#1'],
      order: POST(1),
      timers: ['setTimeout(20000)']
    });
    // The echo replaces the activity (no "state" yet); "sent" only once the post returned too.
    expect(summary.echo).toEqual({ activities: ['hello:/sending'], order: ['activities'] });
    expect(summary.returns).toEqual({
      activities: ['hello:sent/sent'],
      calls: ['dl1.post#1.next(a1)', 'dl1.post#1.unsubscribe#1'],
      order: ['activities']
    });
  });

  test('quirk: impeded at 20 s writes only "state"; an echo after it still sends', async () => {
    const summary = summarize(await run('no echo: impeded at 20 s, echo at 25 s, sent'));

    expect(summary['t=19999']).toEqual({});
    expect(summary['t=20000']).toEqual({
      activities: ['hello:send failed/sending'],
      order: ['activities'],
      timers: ['setTimeout(280000)']
    });
    expect(summary['t=25000, echo'].activities).toEqual(['hello:/sending', 'hello:sent/sent']);
    // The timers are not cleared after "sent": nothing happens at 300 s.
    expect(summary['t=300000']).toEqual({});
  });

  test('rejected at 300 s, with an error that says what is missing', async () => {
    expect(summarize(await run('no echo: impeded at 20 s, rejected at 300 s'))['t=300000']).toEqual({
      activities: ['hello:send failed/send failed'],
      console: [`${FAILED} Error(timed out while waiting for outgoing message to echo back)`],
      order: ['activities']
    });
    expect(summarize(await run('echo, the post never returns: rejected at 300 s'))['t=300000']).toEqual({
      activities: ['hello:send failed/send failed'],
      calls: ['dl1.post#1.unsubscribe#1'],
      console: [`${FAILED} Error(timed out while waiting for postActivity to return any values)`],
      order: ['activities']
    });
  });

  test('send timeout: read when posting; above 300 s, rejected right after impeded', async () => {
    const changed = summarize(await run('send timeout changed while posting'));

    expect(changed['t=5000'].activities).toEqual(['first:sending/sending, second:send failed/sending']);
    expect(changed['t=20000'].activities).toEqual(['first:send failed/sending, second:send failed/sending']);
    expect(summarize(await run('send timeout above 300 s'))['t=400000'].timers).toEqual(['setTimeout(0)']);
  });

  test('offline: posts in flight are rejected without an error, after incoming stops and before the status', async () => {
    const summary = summarize(await run('disconnect with 2 posts in flight'));

    expect(summary.disconnect).toEqual({
      activities: [
        'first:send failed/send failed, second:sending/sending',
        'first:send failed/send failed, second:send failed/send failed'
      ],
      calls: ['dl1.end()', 'dl1.post#1.unsubscribe#1'],
      order: ['activities', 'activities', 'connectivityStatus']
    });
    // Quirk: the echo after going offline is dropped.
    expect(summary['echo after']).toEqual({});
  });

  test('quirk: posts while offline (before, connecting, reconnecting, after) are dropped', async () => {
    const summary = summarize(
      await run('post before connect, while connecting, reconnecting and after disconnect: dropped')
    );

    for (const label of [
      'post before connect',
      'post while connecting',
      'post while reconnecting',
      'post after disconnect'
    ]) {
      // eslint-disable-next-line security/detect-object-injection
      expect(summary[label]).toEqual({});
    }
  });

  test('quirk: ClientCapabilities on the first post of each online period, typing included', async () => {
    const posted = (records: StepRecord[]) =>
      records.flatMap(({ posted }) => posted).map((activity: any) => !!activity.entities?.length);

    expect(posted(await run('ClientCapabilities again after reconnect'))).toEqual([true, true]);
    expect(posted(await run('ClientCapabilities on the first post only'))).toEqual([true, false]);
    expect(posted(await run('ClientCapabilities on a typing activity first'))).toEqual([true, false]);
    expect(posted(await run('ClientCapabilities on a failed post'))).toEqual([true, false]);
  });

  test('quirk: a failing "sent" write is reported as a failed post; a failing "sending" write stops everything', async () => {
    expect(summarize(await run('fault: writing "sent" throws'))['returns, echo'].console).toEqual([
      `${FAILED} Error(fulfilled boom)`
    ]);

    const fatal = summarize(await run('fault: writing "sending" throws'));

    // The post in flight is unsubscribed first, then everything stops; it is rejected without an error, last.
    expect(fatal['post that throws'].calls).toEqual(['dl1.post#1.unsubscribe#1', 'dl1.end()']);
    expect(fatal['post that throws'].order).toEqual(['connectivityStatus', 'notifications', 'activities']);
    expect(fatal['post that throws'].console).toEqual(['error: Error(pending boom)']);
    expect(fatal['post after']).toEqual({});
  });

  test('submit: clears the value, posts, clears the attachments, then the suggested actions', async () => {
    expect(summarize(await run('submit: value')).submit.order).toEqual([
      'sendBoxValue',
      ...POST(1, false),
      'sendBoxAttachments',
      'suggestedActions'
    ]);
    expect(summarize(await run('submit: attachments'))['submit the attachments'].order).toEqual([
      ...POST(1, false),
      'sendBoxAttachments',
      'suggestedActions'
    ]);
  });

  test('quirk: submit offline keeps the send box; whitespace only clears it and sends nothing', async () => {
    const offline = await run('submit: offline keeps the send box');

    for (const label of ['submit before connect', 'submit while connecting', 'submit while reconnecting']) {
      expect(offline.find(record => record.label === label)).toMatchObject({ calls: [], order: [] });
    }

    expect(summarize(await run('submit: whitespace, empty'))['submit whitespace']).toEqual({
      order: ['sendBoxValue', 'sendBoxAttachments']
    });
  });

  test('typing: at most every 3 s; the latest keystroke restarts the wait (takeLatest)', async () => {
    const summary = summarize(await run('typing: at 0, 3 and 6 s while typing'));

    expect(summary['+0, "a"'].calls).toEqual(['dl1.postActivity#1', 'dl1.post#1.subscribe#1']);
    expect(summary['+1000, "ab"']).toEqual({ order: ['sendBoxValue'], timers: ['setTimeout(2000)'] });
    expect(summary['+1000, "abc"']).toEqual({ order: ['sendBoxValue'], timers: ['setTimeout(1000)'] });
    // At 3 s, the keystroke posts without waiting (the wait of "abc" is cancelled, its timer left).
    expect(summary['+1000, "abcd"'].order).toEqual(['sendBoxValue', ...POST(2, false)]);
    expect(summary['+500, "abcde"']).toEqual({ order: ['sendBoxValue'], timers: ['setTimeout(2500)'] });
    expect(summary['+2500, "abcdef"'].order).toEqual(['sendBoxValue', ...POST(3, false)]);
  });

  test('quirk: a message cancels the pending typing and resets; an event cancels it only', async () => {
    const message = summarize(await run('typing: a message at 1.5 s cancels the pending typing and resets'));

    expect(message['t=3000']).toEqual({});
    expect(message['t=3500, type'].order).toEqual(['sendBoxValue', ...POST(3, false)]);

    const event = summarize(await run('typing: an event at 1.5 s cancels the pending typing without resetting'));

    expect(event['t=2000, type'].timers).toEqual(['setTimeout(1000)']);
    expect(event['t=3000'].order).toEqual(POST(3, false));
  });

  test('quirk: typing for the same text again; not for an empty text, which does not cancel', async () => {
    const summary = summarize(await run('typing: the same text twice, empty text'));

    expect(summary['t=1000, same text']).toEqual({ timers: ['setTimeout(2000)'] });
    expect(summary['t=3000'].order).toEqual(POST(2, false));
  });

  test('typing: off cancels the pending typing; on again resets', async () => {
    const summary = summarize(await run('typing: off with a pending typing, then on'));

    expect(summary['t=3000, type']).toEqual({ order: ['sendBoxValue'] });
    expect(summary['t=3500, typing on, type'].order).toEqual([
      'sendTypingIndicator',
      'sendBoxValue',
      ...POST(2, false)
    ]);
  });

  test('quirk: a POST_ACTIVITY without meta, or a SEND_MESSAGE with a wrong payload, stops everything when online', async () => {
    const noMeta = summarize(await run('dispatch: POST_ACTIVITY without meta when online'));

    expect(noMeta['POST_ACTIVITY without meta'].order).toEqual(['connectivityStatus', 'notifications']);
    expect(noMeta['post after']).toEqual({});
    expect(summarize(await run('dispatch: the send actions when offline'))).toEqual({
      'SEND_MESSAGE, POST_ACTIVITY without meta': {}
    });
    expect(
      summarize(await run('dispatch: SEND_MESSAGE with a wrong payload when online'))[
        'SEND_MESSAGE, attachments not an array'
      ].order
    ).toEqual(['connectivityStatus', 'notifications']);
  });
});
