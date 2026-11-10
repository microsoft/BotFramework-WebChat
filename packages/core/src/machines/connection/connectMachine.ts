/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */

import { CONNECT } from '../../actions/connect';
import { DISCONNECT, DISCONNECT_FULFILLED, DISCONNECT_PENDING } from '../../actions/disconnect';
import { RECONNECT } from '../../actions/reconnect';
import updateConnectionStatus, { UPDATE_CONNECTION_STATUS } from '../../actions/updateConnectionStatus';
import rectifyUserID from '../../services/private/rectifyUserID';
import { forkPut, is } from '../private/effects';
import type { Machine, MachineAction, Scope } from '../types';

// Direct Line connection status.
const CONNECTING = 1;
const ONLINE = 2;
const UNINITIALIZED = 0;

type Session = {
  readonly directLine: any;
  readonly meta: { readonly userID: string; readonly username: string };
};

/**
 * `runAsyncEffectUntilDisconnect()` of `connectSaga`: puts `*_PENDING`, then races `DISCONNECT` (an error) with `body`;
 * then puts `*_FULFILLING` and `*_FULFILLED`, or `*_REJECTED`. It returns once these puts ran (they are forked).
 */
function runAsyncUntilDisconnect<T>(
  scope: Scope,
  type: string,
  { directLine, meta }: Session,
  body: (scope: Scope, returns: (value: T) => void) => void,
  then: (value: T) => void,
  onError: (error: unknown) => void
): void {
  const payload = { directLine };

  scope.call<T>(
    (task, returns) => {
      forkPut(task, { type: `${type}_PENDING`, meta, payload });

      const reject = (error: unknown) => {
        forkPut(task, { type: `${type}_REJECTED`, error: true, meta, payload: error });

        throw error;
      };

      // eslint-disable-next-line prefer-const
      let stopBody: () => void;

      // The race: `takeDisconnectAsError()` waits first.
      const stopTakingDisconnect = task.take(is(DISCONNECT), () => {
        const error = new Error('disconnected');

        stopBody();
        reject(error);
      });

      stopBody = task.call<T>(
        body,
        result => {
          stopTakingDisconnect();
          forkPut(task, { type: `${type}_FULFILLING`, meta, payload }, { type: `${type}_FULFILLED`, meta, payload });
          returns(result);
        },
        error => {
          stopTakingDisconnect();
          reject(error);
        }
      );
    },
    then,
    onError
  );
}

/** The inner `connectSaga()`: keeps `activity$` subscribed (Direct Line starts then), until online or failed. */
function connectDirectLine(scope: Scope, directLine: any, returns: (endDirectLine: () => void) => void): void {
  const activitySubscription = directLine.activity$.subscribe({ next: () => 0 });
  const unsubscribeActivity = activitySubscription.unsubscribe.bind(activitySubscription);

  // Unsubscribed only if it failed or was cancelled: once online, Direct Line relies on the subscription.
  scope.finally(cancelled => cancelled && unsubscribeActivity());

  const loop = () =>
    scope.take(is(UPDATE_CONNECTION_STATUS), ({ payload: { connectionStatus } }) => {
      if (connectionStatus === ONLINE) {
        // DirectLineJS does not end the connection when unsubscribed: `end()` is called too.
        returns(() => {
          unsubscribeActivity();
          directLine.end();
        });
      } else if (connectionStatus !== UNINITIALIZED && connectionStatus !== CONNECTING) {
        const error = new Error(`Failed to connect, DirectLineJS returned ${connectionStatus}.`);

        unsubscribeActivity();

        throw error;
      } else {
        loop();
      }
    });

  loop();
}

/** `reconnectSaga()`: waits for the connection to be online again. */
function reconnectDirectLine(scope: Scope): void {
  const loop = () =>
    scope.take(is(UPDATE_CONNECTION_STATUS), ({ payload: { connectionStatus } }) => {
      if (connectionStatus === CONNECTING) {
        loop();
      } else if (connectionStatus !== ONLINE) {
        throw new Error(`Failed to reconnect. DirectLineJS returned ${connectionStatus}.`);
      }
    });

  loop();
}

/** One connection, from `CONNECT` to `DISCONNECT_FULFILLED`; `then` is called when the connect loop goes on. */
function connection(
  scope: Scope,
  { payload: { directLine, userID: userIDFromAction, username } }: MachineAction,
  then: () => void
): void {
  // The connection status of Direct Line as actions, until the connection ends.
  const statusUpdate = scope.fork(observer =>
    observer.observeEach(directLine.connectionStatus$, (connectionStatus, next) =>
      observer.put(updateConnectionStatus(connectionStatus as any), next)
    )
  );

  const rectifiedUserID = rectifyUserID(directLine, userIDFromAction);
  const session: Session = { directLine, meta: { userID: rectifiedUserID.final, username } };

  // DirectLineJS may still prefer the user ID burnt in the token: `setUserId()` only if it is different.
  directLine.setUserId &&
    rectifiedUserID.fromToken !== session.meta.userID &&
    directLine.setUserId(session.meta.userID);

  let endDirectLine: (() => void) | undefined;

  // The `finally` of the connect loop: even if the connection was interrupted, DISCONNECT_PENDING, then
  // DISCONNECT_FULFILLED.
  const finish = (disconnectMeta: { readonly error: unknown } | undefined) => {
    statusUpdate.stop();
    forkPut(
      scope,
      { type: DISCONNECT_PENDING, meta: disconnectMeta, payload: { directLine } },
      { type: DISCONNECT_FULFILLED, meta: disconnectMeta, payload: { directLine } }
    );
  };

  // Before online, the connection ends on an error, without `end()`.
  const fail = (error: unknown) => {
    finish({ error });
    then();
  };

  // Once online, `end()` first: on DISCONNECT (no error), or an error. An `end()` that throws is the error.
  const end = (error?: { readonly error: unknown } | undefined) => {
    let disconnectMeta = error;

    try {
      endDirectLine();
    } catch (endError) {
      disconnectMeta = { error: endError };
    }

    finish(disconnectMeta);
    then();
  };

  const online = () => {
    // eslint-disable-next-line prefer-const
    let stopTakingStatus: () => void;
    const stopTakingDisconnect = scope.take(is(DISCONNECT), () => {
      stopTakingStatus();
      end();
    });

    stopTakingStatus = scope.take(is(UPDATE_CONNECTION_STATUS), ({ payload: { connectionStatus } = {} as any }) => {
      stopTakingDisconnect();

      if (connectionStatus === CONNECTING) {
        // DirectLineJS went back to connecting: a reconnection.
        runAsyncUntilDisconnect<void>(scope, RECONNECT, session, reconnectDirectLine, online, reconnectError =>
          end({ error: reconnectError })
        );
      } else if (connectionStatus === ONLINE) {
        online();
      } else if (typeof connectionStatus === 'undefined') {
        end();
      } else {
        // DirectLineJS wants to close the connection.
        end({ error: new Error(`Connection status changed to ${connectionStatus}`) });
      }
    });
  };

  // Stopped (a saga error): as the connect loop cancelled, it ends the connection without an error, and stops.
  scope.finally(cancelled => {
    if (cancelled) {
      let disconnectMeta: { readonly error: unknown } | undefined;

      try {
        endDirectLine?.();
      } catch (error) {
        disconnectMeta = { error };
      }

      finish(disconnectMeta);
    }
  });

  runAsyncUntilDisconnect<() => void>(
    scope,
    CONNECT,
    session,
    (task, returns) => connectDirectLine(task, directLine, returns),
    end => {
      endDirectLine = end;
      online();
    },
    fail
  );
}

/**
 * `connectSaga`: connects to Direct Line on `CONNECT`, as `CONNECT_PENDING`, `CONNECT_FULFILLING`, `CONNECT_FULFILLED`
 * (or `CONNECT_REJECTED`), the reconnections the same, then disconnects on `DISCONNECT` or an error, as
 * `DISCONNECT_PENDING` and `DISCONNECT_FULFILLED`. Takes `CONNECT` again only after.
 *
 * Quirks kept, as the saga (to fix later):
 *
 * - disconnecting before online does not call `end()` (only the keep-alive subscription of `activity$` is
 *   unsubscribed), and is an error (status "error");
 * - an `end()` that throws, or no `end()`, makes a disconnection an error;
 * - `CONNECT` while connected is not taken;
 * - an error while putting `CONNECT_FULFILLED` (a listener) fails the connection, and leaves `activity$` subscribed.
 */
const connectMachine: Machine = scope => {
  const loop = () => scope.take(is(CONNECT), action => scope.fork(child => connection(child, action, loop)));

  loop();
};

export default connectMachine;
