import { withResolvers } from '@msinternal/botframework-webchat-base/utils';
import Observable from 'core-js/features/observable';
import random from 'math-random';
import updateIn from 'simple-update-in';

import createDeferredObservable from '../../utils/createDeferredObservable';
import became from '../pageConditions/became';
import { createStoreWithOptions } from './createStore';
import shareObservable from './shareObservable';

function isNativeClock() {
  return ('' + setTimeout).endsWith('() { [native code] }');
}

function uniqueId() {
  return random().toString(36).substring(2, 7);
}

export default function createDirectLineEmulator({ autoConnect = true, ponyfill = {} } = {}) {
  const { Date = window.Date } = ponyfill;
  const store = createStoreWithOptions({ ponyfill });

  if (!isNativeClock()) {
    throw new Error('Fake timer is detected at global-level. You must pass it via the "ponyfill" option.');
  }

  const now = Date.now();
  const getTimestamp = () => new Date().toISOString();

  const connectedWithResolvers = withResolvers();
  const connectionStatusDeferredObservable = createDeferredObservable(() => {
    connectionStatusDeferredObservable.next(0);
  });
  const activityDeferredObservable = createDeferredObservable(async () => {
    connectionStatusDeferredObservable.next(1);

    await connectedWithResolvers.promise;
    connectionStatusDeferredObservable.next(2);
  });

  const postActivityCallDeferreds = [];
  const postActivity = outgoingActivity => {
    const returnPostActivityWithResolvers = withResolvers();

    const deferred = postActivityCallDeferreds.shift();

    if (!deferred) {
      throw new Error(
        'When DirectLineEmulator is installed, you must call actPostActivity() before sending a message.'
      );
    }

    deferred.resolve({ outgoingActivity, returnPostActivityDeferred: returnPostActivityWithResolvers });

    return new Observable(observer => {
      (async function () {
        try {
          observer.next(await returnPostActivityWithResolvers.promise);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  };

  const actPostActivity = async (fn, { id: idFromOptions } = {}) => {
    const postActivityCallWithResolvers = withResolvers();

    postActivityCallDeferreds.push(postActivityCallWithResolvers);

    await fn();

    const { outgoingActivity, returnPostActivityDeferred } = await postActivityCallWithResolvers.promise;
    const id = idFromOptions || uniqueId();

    let echoBackActivity = { ...outgoingActivity, id, timestamp: getTimestamp() };

    const echoBack = async updater => {
      if (typeof updater === 'function') {
        echoBackActivity = updater(echoBackActivity);
      }

      activityDeferredObservable.next(echoBackActivity);

      await became(
        'echo back activity appears in the store',
        () => store.getState().activities.find(activity => activity.id === echoBackActivity.id),
        1000
      );
    };

    const rejectPostActivity = error => returnPostActivityDeferred.reject(error);
    const resolvePostActivity = () => returnPostActivityDeferred.resolve(id);

    const resolveAll = async updater => {
      await echoBack(updater);
      resolvePostActivity();
    };

    return { activity: outgoingActivity, echoBack, rejectPostActivity, resolveAll, resolvePostActivity };
  };

  autoConnect && connectedWithResolvers.resolve();

  const directLine = {
    activity$: shareObservable(activityDeferredObservable.observable),
    actPostActivity,
    connectionStatus$: shareObservable(connectionStatusDeferredObservable.observable),
    end: () => {
      // This is a mock and will no-op on dispatch().
    },
    postActivity,
    emulateReconnect: () => {
      connectionStatusDeferredObservable.next(1);

      return {
        resolve: () => connectionStatusDeferredObservable.next(2)
      };
    },
    emulateConnected: connectedWithResolvers.resolve,
    emulateIncomingActivity: async (activity, { skipWait } = {}) => {
      if (typeof activity === 'string') {
        activity = {
          from: { id: 'bot', role: 'bot' },
          id: uniqueId(),
          text: activity,
          timestamp: getTimestamp(),
          type: 'message'
        };
      } else {
        activity = updateIn(activity, ['from', 'role'], role => role || 'bot');
        activity = updateIn(activity, ['id'], id => id || uniqueId());
        activity = updateIn(activity, ['timestamp'], timestamp =>
          typeof timestamp === 'number'
            ? new Date(now + timestamp).toISOString()
            : 'timestamp' in activity // If `activity.timestamp` is `undefined`, let it in.
              ? timestamp
              : getTimestamp()
        );
        activity = updateIn(activity, ['type'], type => type || 'message');
      }

      const { id } = activity;

      activityDeferredObservable.next(activity);

      skipWait ||
        (await became(
          'incoming activity appears in the store',
          () => store.getState().activities.find(activity => activity.id === id),
          1000
        ));
    },
    emulateOutgoingActivity: (activity, options) => {
      if (typeof activity === 'string') {
        activity = {
          from: { id: 'user', role: 'user' },
          text: activity,
          type: 'message'
        };
      }

      return actPostActivity(
        () =>
          store.dispatch({
            meta: { method: 'code' },
            payload: { activity },
            type: 'DIRECT_LINE/POST_ACTIVITY'
          }),
        options
      );
    }
  };

  return { directLine, store };
}
