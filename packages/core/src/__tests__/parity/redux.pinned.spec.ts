/**
 * @jest-environment @happy-dom/jest-environment
 */
// What the sagas do today, pinned before the services are written against them (Redux mode, unchanged), and the machines
// that replace them do the same. The parity specs (`services/*.parity.spec.ts`) then compare the services with Redux
// mode on every script; these pins make sure that its side of the comparison does not move unnoticed, especially on the
// paths that look like bugs.
import connectionScripts from './connectionScripts';
import { REDUX_DRIVERS } from './createReduxDriver';
import incomingScripts from './incomingScripts';
import runParityScript, { type StepRecord } from './runParityScript';

type Summary = {
  calls?: readonly string[];
  console?: readonly string[];
  notifications?: readonly string[];
  status?: readonly string[];
};

function summarize(records: readonly StepRecord[]): Record<string, Summary> {
  return Object.fromEntries(
    records.map(({ calls, changes, console, label }) => {
      const summary: Summary = {};

      calls.length && (summary.calls = calls);
      console.length && (summary.console = console);
      changes.notifications &&
        (summary.notifications = changes.notifications.map(
          (value: any) => `${value.connectivitystatus?.level}/${value.connectivitystatus?.message}`
        ));
      changes.connectivityStatus && (summary.status = changes.connectivityStatus as string[]);

      return [label, summary];
    })
  );
}

const CONNECT = Object.freeze([
  'dl1.connectionStatus$.subscribe#1',
  'dl1.connectionStatus$.subscribe#2',
  'dl1.setUserId("u-1")',
  'dl1.activity$.subscribe#1'
]);

const ONLINE = Object.freeze(['dl1.connectionStatus$.subscribe#3', 'dl1.activity$.subscribe#2']);

describe.each(REDUX_DRIVERS)('Redux mode on the %s, pinned', (_, createReduxDriver) => {
  test('connect: notification subscription, status subscription, setUserId(), keep-alive activity$; online: reference grammar, then incoming', async () => {
    expect(summarize(await runParityScript(createReduxDriver, connectionScripts['connect successfully']))).toEqual({
      connect: { calls: CONNECT, notifications: ['info/connecting'] },
      'status 1': {},
      'status 2': { calls: ONLINE, notifications: ['success/connected'], status: ['connected'] }
    });
  });

  test('quirk: disconnecting before online does not call end(), and sets status "error"', async () => {
    expect(
      summarize(await runParityScript(createReduxDriver, connectionScripts['disconnect before connection established']))
    ).toEqual({
      connect: { calls: CONNECT, notifications: ['info/connecting'] },
      'status 1': {},
      disconnect: {
        calls: ['dl1.activity$.unsubscribe#1', 'dl1.connectionStatus$.unsubscribe#2'],
        status: ['error']
      },
      // Quirk: the notification subscription outlives the disconnect, until the next connect.
      'status 2 after disconnect': { notifications: ['success/connected'] }
    });
  });

  test('quirk: connecting while connected only restarts the notification subscription', async () => {
    const summary = summarize(
      await runParityScript(createReduxDriver, connectionScripts['connect another Direct Line without disconnecting'])
    );

    expect(summary['connect dl2']).toEqual({
      calls: ['dl1.connectionStatus$.unsubscribe#1', 'dl2.connectionStatus$.subscribe#1'],
      notifications: ['info/connecting']
    });
    expect(summary['dl1 status 1']).toEqual({
      calls: ['dl1.connectionStatus$.unsubscribe#3', 'dl1.activity$.unsubscribe#2'],
      status: ['reconnecting']
    });
  });

  test('fatal, during a write (receiving an activity throws): all sagas stop in fork order, the connect loop disconnects and stops', async () => {
    expect(
      summarize(await runParityScript(createReduxDriver, incomingScripts['fatal: receiving an activity throws']))
    ).toEqual({
      connect: { calls: CONNECT, notifications: ['info/connecting'] },
      online: { calls: ONLINE, notifications: ['success/connected'], status: ['connected'] },
      activity: {},
      'the activity that throws': {
        calls: [
          // connectionStatusToNotificationSaga
          'dl1.connectionStatus$.unsubscribe#1',
          // connectionStatusUpdateSaga
          'dl1.connectionStatus$.unsubscribe#3',
          // connectSaga: as on disconnect
          'dl1.activity$.unsubscribe#1',
          'dl1.end()',
          'dl1.connectionStatus$.unsubscribe#2',
          // observeActivitySaga
          'dl1.activity$.unsubscribe#2',
          // redux-saga logs the error after every saga stopped
          'console.error: Error(receive boom)'
        ],
        console: ['error: Error(receive boom)'],
        notifications: ['success/javascripterror'],
        // The disconnect comes after the saga error: "sagaerror" stays.
        status: ['sagaerror']
      },
      'activity after': {},
      reconnecting: {},
      disconnect: {},
      // Every saga stopped, the connect loop too (native generators; down-leveled by regenerator, it looped again).
      'connect again': {}
    });
  });

  test('fatal, outside a write (an activity that is not an object): the failing saga first, "notconnected" before "sagaerror"', async () => {
    expect(
      summarize(await runParityScript(createReduxDriver, incomingScripts['fatal: an activity that is not an object']))
    ).toEqual({
      connect: { calls: CONNECT, notifications: ['info/connecting'] },
      online: { calls: ONLINE, notifications: ['success/connected'], status: ['connected'] },
      activity: {},
      null: {
        calls: [
          // observeActivitySaga, which failed
          'dl1.activity$.unsubscribe#2',
          'dl1.connectionStatus$.unsubscribe#1',
          'dl1.connectionStatus$.unsubscribe#3',
          'dl1.activity$.unsubscribe#1',
          'dl1.end()',
          'dl1.connectionStatus$.unsubscribe#2',
          "console.error: Error(Cannot read properties of null (reading 'attachmentLayout'))"
        ],
        console: ["error: Error(Cannot read properties of null (reading 'attachmentLayout'))"],
        notifications: ['success/javascripterror'],
        status: ['notconnected', 'sagaerror']
      },
      'activity after': {},
      disconnect: {},
      'connect again': {},
      'online again': {},
      'activity when online again': {},
      'disconnect again': {}
    });
  });

  test('fatal while connecting (a listener throws on "connectingslow"): no end()', async () => {
    expect(
      summarize(
        await runParityScript(
          createReduxDriver,
          connectionScripts['fatal: a listener of the status throws on connectingslow']
        )
      )
    ).toEqual({
      connect: { calls: CONNECT, notifications: ['info/connecting'] },
      '15000 ms': {
        calls: [
          'dl1.connectionStatus$.unsubscribe#1',
          'dl1.activity$.unsubscribe#1',
          'dl1.connectionStatus$.unsubscribe#2',
          'console.error: Error(listener on connectingslow)'
        ],
        console: ['error: Error(listener on connectingslow)'],
        notifications: ['info/javascripterror'],
        status: ['connectingslow', 'sagaerror']
      },
      'status 2': {},
      activity: {},
      disconnect: {},
      'connect again': {}
    });
  });

  test('fatal in the connect loop itself (a listener throws on "notconnected"): the connect loop stops too', async () => {
    const summary = summarize(
      await runParityScript(
        createReduxDriver,
        connectionScripts['fatal: a listener of the status throws on notconnected']
      )
    );

    expect(summary.disconnect).toEqual({
      calls: [
        'dl1.activity$.unsubscribe#1',
        'dl1.end()',
        'dl1.connectionStatus$.unsubscribe#2',
        'dl1.connectionStatus$.unsubscribe#3',
        'dl1.activity$.unsubscribe#2',
        'dl1.connectionStatus$.unsubscribe#1',
        'console.error: Error(listener on notconnected)'
      ],
      console: ['error: Error(listener on notconnected)'],
      notifications: ['success/javascripterror'],
      status: ['notconnected', 'sagaerror']
    });
    expect(summary['connect again']).toEqual({});
  });

  test('not fatal: a listener that throws on "connected" fails the connection, and the keep-alive activity$ subscription leaks', async () => {
    const summary = summarize(
      await runParityScript(createReduxDriver, connectionScripts['fatal: a listener of the status throws on connected'])
    );

    expect(summary['status 2']).toEqual({
      calls: [
        ...ONLINE,
        'dl1.connectionStatus$.unsubscribe#2',
        'dl1.connectionStatus$.unsubscribe#3',
        'dl1.activity$.unsubscribe#2'
      ],
      notifications: ['success/connected'],
      status: ['connected', 'error']
    });
  });

  test('not fatal: a listener that throws on "reconnecting" fails the connection', async () => {
    const summary = summarize(
      await runParityScript(
        createReduxDriver,
        connectionScripts['fatal: a listener of the status throws on reconnecting']
      )
    );

    expect(summary['status 1']).toEqual({
      calls: [
        'dl1.activity$.unsubscribe#1',
        'dl1.end()',
        'dl1.connectionStatus$.unsubscribe#2',
        'dl1.connectionStatus$.unsubscribe#3',
        'dl1.activity$.unsubscribe#2'
      ],
      notifications: ['info/reconnecting'],
      status: ['reconnecting', 'error']
    });
  });

  test('every script runs on the sagas without throwing', async () => {
    for (const script of Object.values({ ...connectionScripts, ...incomingScripts })) {
      // eslint-disable-next-line no-await-in-loop
      await expect(runParityScript(createReduxDriver, script)).resolves.toEqual(expect.any(Array));
    }
  });
});
