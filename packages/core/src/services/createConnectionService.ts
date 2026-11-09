/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */

import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { NotificationsCell } from './createNotificationsCell';
import createCell from './private/createCell';
import getConnectivityStatusNotification from './private/getConnectivityStatusNotification';
import rectifyUserID from './private/rectifyUserID';
import subscribeQueue, { type QueueSubscription } from './private/subscribeQueue';
import type { Notify, Source } from './types';

// Direct Line connection status.
const CONNECTING = 1;
const ONLINE = 2;
const UNINITIALIZED = 0;

const SLOW_CONNECTION_AFTER = 15_000;

type ConnectionSession = {
  readonly directLine: any;
  /** The user ID after `rectifyUserID()`. */
  readonly userID: string;
  readonly username: string | undefined;
};

/** Runs while the connection is online; returns the function that stops it, when the connection goes offline. */
type OnlineStarter = (session: ConnectionSession) => () => void;

type FailOptions = {
  /** `true` if the error was thrown while writing a value (e.g. by a listener), as a saga `put()` would throw. */
  readonly insideWrite?: boolean | undefined;
};

type ConnectionService = {
  /** `uninitialized`, `connected`, `reconnecting`, `reconnected`, `connectingslow`, `notconnected`, `error`, `sagaerror`. */
  readonly connectivityStatus: Source<string>;
  /** Connects, as `DIRECT_LINE/CONNECT`. While connected, only restarts the "connectivitystatus" notification. */
  readonly connect: (init: { readonly directLine: any; readonly userID?: unknown; readonly username?: string }) => void;
  /** Disconnects, as `DIRECT_LINE/DISCONNECT`. Does nothing while disconnected. */
  readonly disconnect: () => void;
  /** Stops everything, for good: the service is not used after this. Construction does nothing until `connect()`. */
  readonly dispose: () => void;
  /**
   * An error that the sagas would not catch: stops everything as a saga error does in Redux mode (status "sagaerror").
   * The caller stops its own work first.
   */
  readonly fail: (error: unknown, options?: FailOptions) => void;
  /** `true` after an error that the sagas would not catch (`fail()`): every saga is stopped, for good. */
  readonly hasFailed: () => boolean;
  /**
   * Calls `start` each time the connection goes online, and the function it returns when it goes offline (reconnecting
   * or disconnecting), as `whileConnected()` of the sagas. Starters run in the order they were added.
   */
  readonly onOnline: (start: OnlineStarter) => () => void;
  /** `directLine.referenceGrammarId`, read on each connection status while online; kept after disconnect. */
  readonly referenceGrammarID: Source<string | null>;
};

type Session = ConnectionSession & {
  readonly activitySubscription: { unsubscribe(): void };
  phase: 'connecting' | 'online' | 'reconnecting';
  readonly statusSubscription: QueueSubscription;
};

/**
 * The connection to Direct Line without Redux: the same observable behaviour as `connectSaga`,
 * `connectionStatusToNotificationSaga`, `connectionStatusUpdateSaga`, `detectSlowConnectionSaga` and the
 * `connectivityStatus` and `referenceGrammarID` reducers, including the calls made to Direct Line and their order.
 *
 * Quirks kept on purpose, as in Redux mode (to fix in both modes later):
 *
 * - disconnecting before online does not call `end()`, and sets the status to "error";
 * - the "connectivitystatus" notification follows the Direct Line until the next `connect()`, after a disconnect too;
 * - `connect()` while connected only restarts the notification;
 * - after an error that the sagas do not catch, only the connection itself keeps working (connect, disconnect): no
 *   notification, no slow connection, nothing runs while online, and the status stays "sagaerror".
 *
 * Not kept: the slow connection timer is cleared when the connection completes (the saga left it running, unused).
 */
export default function createConnectionService({
  notifications,
  notify = callListeners => callListeners(),
  ponyfill
}: {
  readonly notifications: Pick<NotificationsCell, 'markJavaScriptError' | 'setNotification'>;
  readonly notify?: Notify | undefined;
  readonly ponyfill: Pick<GlobalScopePonyfill, 'clearTimeout' | 'setTimeout'>;
}): ConnectionService {
  const connectivityStatus = createCell('uninitialized', notify);
  const referenceGrammarID = createCell<string | null>(null, notify);
  const starters: OnlineStarter[] = [];
  let dead = false;
  // After an error that the sagas do not catch: only the connection itself keeps working.
  let fatal = false;
  let lastWriteError: { readonly error: unknown } | undefined;
  let notificationSubscription: QueueSubscription | undefined;
  let referenceGrammarStop: (() => void) | undefined;
  let runningStops: (() => void)[] = [];
  let session: Session | undefined;
  let slowTimer: { readonly handle: ReturnType<GlobalScopePonyfill['setTimeout']> } | undefined;

  // A write that throws (e.g. a listener) is an error "inside a write", as a saga `put()` that throws.
  const write = (fn: () => void) => {
    try {
      fn();
    } catch (error) {
      lastWriteError = { error };

      throw error;
    }
  };

  const writeStatus = (value: string) =>
    // As the reducer: "sagaerror" stays.
    connectivityStatus.get() !== 'sagaerror' && write(() => connectivityStatus.set(value));

  // eslint-disable-next-line prefer-const
  let fail: (error: unknown, origin: 'external' | 'machine' | 'notifications' | 'referenceGrammar' | 'slow') => void;

  const guard =
    <T extends unknown[]>(origin: Parameters<typeof fail>[1], fn: (...args: T) => void) =>
    (...args: T): void => {
      try {
        fn(...args);
      } catch (error) {
        fail(error, origin);
      }
    };

  // detectSlowConnectionSaga: one timer from *_PENDING, until *_FULFILLED or *_REJECTED. As the saga's `race()` with a
  // `sleep()` promise, the timer wins a turn after it fires, so a status already queued wins over it.
  const startSlowTimer = () => {
    if (!fatal && !slowTimer) {
      const timer = {
        handle: ponyfill.setTimeout(
          () =>
            Promise.resolve().then(
              guard('slow', () => {
                if (slowTimer === timer) {
                  slowTimer = undefined;
                  writeStatus('connectingslow');
                }
              })
            ),
          SLOW_CONNECTION_AFTER
        )
      };

      slowTimer = timer;
    }
  };

  const stopSlowTimer = () => {
    if (slowTimer) {
      ponyfill.clearTimeout(slowTimer.handle);
      slowTimer = undefined;
    }
  };

  // *_FULFILLING: whileConnected() starts. connectionStatusUpdateSaga first, then the starters added.
  const goOnline = ({ directLine, userID, username }: ConnectionSession) => {
    if (fatal) {
      return;
    }

    const statusUpdateSubscription = subscribeQueue(
      directLine.connectionStatus$,
      guard('referenceGrammar', () => {
        // connectionStatusUpdateSaga: `readyState` has no reader and is not kept.
        const value = directLine.referenceGrammarId || null;

        write(() => referenceGrammarID.set(value));
      })
    );

    referenceGrammarStop = () => statusUpdateSubscription.unsubscribe();
    runningStops = [];

    for (const start of starters.slice()) {
      runningStops.push(start(Object.freeze({ directLine, userID, username })));
    }
  };

  // DISCONNECT_PENDING, RECONNECT_PENDING: whileConnected() stops, in the same order.
  const goOffline = () => {
    const stops = runningStops;

    runningStops = [];
    referenceGrammarStop?.();
    referenceGrammarStop = undefined;
    stops.forEach(stop => stop());
  };

  // The end of a connection: the `finally` of the connect loop, then DISCONNECT_PENDING and DISCONNECT_FULFILLED.
  const endSession = (reason: 'disconnect' | 'error') => {
    const current = session;

    if (!current) {
      return;
    }

    session = undefined;

    const { activitySubscription, directLine, phase, statusSubscription } = current;
    let endFailed = false;

    // DirectLineJS starts only after the first subscription to `activity$`: the keep-alive subscription is unsubscribed,
    // and `end()` is called only if the connection went online once (quirk).
    if (phase === 'connecting') {
      activitySubscription.unsubscribe();
    } else {
      try {
        activitySubscription.unsubscribe();
        directLine.end();
      } catch {
        // As the sagas: a Direct Line without `end()`, or an `end()` that throws, fails the connection, not everything.
        endFailed = true;
      }
    }

    statusSubscription.unsubscribe();

    // CONNECT_REJECTED, RECONNECT_REJECTED.
    if (phase !== 'online') {
      stopSlowTimer();
      phase === 'connecting' && writeStatus('error');
    }

    goOffline();

    // Disconnecting while connecting or reconnecting is an error too (quirk).
    writeStatus(reason === 'disconnect' && phase === 'online' && !endFailed ? 'notconnected' : 'error');
  };

  const handleStatus = (connectionStatus: number) => {
    const current = session;

    if (!current) {
      return;
    }

    if (current.phase === 'online') {
      if (connectionStatus === CONNECTING) {
        // RECONNECT_PENDING
        current.phase = 'reconnecting';
        writeStatus('reconnecting');
        goOffline();
        startSlowTimer();
      } else if (connectionStatus !== ONLINE) {
        endSession('error');
      }
    } else if (connectionStatus === ONLINE) {
      const reconnected = current.phase === 'reconnecting';

      // *_FULFILLING, *_FULFILLED
      current.phase = 'online';
      goOnline(current);
      stopSlowTimer();
      writeStatus(reconnected ? 'reconnected' : 'connected');
    } else if (
      current.phase === 'connecting'
        ? connectionStatus !== UNINITIALIZED && connectionStatus !== CONNECTING
        : connectionStatus !== CONNECTING
    ) {
      endSession('error');
    }
  };

  const restartNotification = (directLine: any) => {
    notificationSubscription?.unsubscribe();
    notificationSubscription = undefined;

    if (fatal) {
      return;
    }

    let reconnecting = false;

    notificationSubscription = subscribeQueue(
      directLine.connectionStatus$,
      guard('notifications', (value: unknown) => {
        const { notification, reconnecting: nextReconnecting } = getConnectivityStatusNotification(value, reconnecting);

        reconnecting = nextReconnecting;
        notification && write(() => notifications.setNotification(notification));
      })
    );
  };

  const connect = guard('machine', ({ directLine, userID, username }: Parameters<ConnectionService['connect']>[0]) => {
    if (dead) {
      return;
    }

    // connectionStatusToNotificationSaga takes the latest CONNECT, even while connected.
    restartNotification(directLine);

    if (session) {
      return;
    }

    const statusSubscription = subscribeQueue(directLine.connectionStatus$, guard('machine', handleStatus));
    const rectifiedUserID = rectifyUserID(directLine, userID);
    const userIDToUse = rectifiedUserID.final;

    // DirectLineJS may still prefer the user ID in the token: call setUserId() only if it is different.
    directLine.setUserId && rectifiedUserID.fromToken !== userIDToUse && directLine.setUserId(userIDToUse);

    // DirectLineJS starts the connection only after the first subscription to `activity$`.
    const activitySubscription = directLine.activity$.subscribe({ next: () => 0 });

    session = {
      activitySubscription,
      directLine,
      phase: 'connecting',
      statusSubscription,
      userID: userIDToUse,
      username
    };

    // CONNECT_PENDING
    connectivityStatus.get() === 'uninitialized' || writeStatus('reconnecting');
    startSlowTimer();
  });

  const disconnect = guard('machine', () => {
    dead || endSession('disconnect');
  });

  fail = (error, origin) => {
    if (dead || (fatal && origin !== 'machine')) {
      return;
    }

    const insideWrite = !!lastWriteError && lastWriteError.error === error;

    lastWriteError = undefined;

    // An error of the connect loop stops it: it stops its connection first.
    if (origin === 'machine') {
      dead = true;

      const current = session;

      if (current) {
        session = undefined;

        try {
          current.activitySubscription.unsubscribe();
          current.phase === 'connecting' || current.directLine.end();
        } catch {
          // Stopping anyway.
        }

        current.statusSubscription.unsubscribe();
      }
    }

    if (fatal) {
      // An error of the connect loop after a fatal error: nothing else to stop.
      return;
    }

    fatal = true;

    // The saga that failed stops first.
    if (origin === 'referenceGrammar') {
      referenceGrammarStop?.();
      referenceGrammarStop = undefined;
    }

    const markSagaError = () => {
      try {
        writeStatus('sagaerror');
        notifications.markJavaScriptError();
      } catch {
        // As in Redux mode, the error of a listener here goes nowhere.
      }
    };

    // An error during a write: the saga error is written before the connect loop disconnects.
    insideWrite && markSagaError();

    // The other sagas stop in the order they were forked: notification, reference grammar, connect loop (it
    // disconnects and keeps running), then the starters (incoming activities).
    notificationSubscription?.unsubscribe();
    notificationSubscription = undefined;
    referenceGrammarStop?.();
    referenceGrammarStop = undefined;

    stopSlowTimer();

    try {
      endSession('disconnect');
    } catch {
      // The status is "sagaerror" (or becomes it next): a listener has nothing to see here.
    }

    goOffline();

    insideWrite || markSagaError();

    console.error(error);
  };

  return Object.freeze({
    connect,
    connectivityStatus: Object.freeze({ get: connectivityStatus.get, subscribe: connectivityStatus.subscribe }),
    disconnect,
    dispose: () => {
      if (!dead) {
        try {
          endSession('disconnect');
        } finally {
          dead = true;
          stopSlowTimer();
          notificationSubscription?.unsubscribe();
          notificationSubscription = undefined;
          goOffline();
        }
      }
    },
    fail: (error: unknown, options?: FailOptions) => {
      options?.insideWrite && (lastWriteError = { error });
      fail(error, 'external');
    },
    hasFailed: () => fatal,
    onOnline: (start: OnlineStarter) => {
      starters.push(start);

      return () => {
        const index = starters.indexOf(start);

        ~index && starters.splice(index, 1);
      };
    },
    referenceGrammarID: Object.freeze({ get: referenceGrammarID.get, subscribe: referenceGrammarID.subscribe })
  });
}

export type { ConnectionService, ConnectionSession, FailOptions, OnlineStarter };
