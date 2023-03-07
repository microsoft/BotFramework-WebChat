import createDeferred from 'p-defer';
import Observable from 'core-js/features/observable';
import random from 'math-random';
import updateIn from 'simple-update-in';

import became from '../pageConditions/became';
import createDeferredObservable from '../../utils/createDeferredObservable';
import shareObservable from './shareObservable';

function getTimestamp() {
  return new Date().toISOString();
}

function uniqueId() {
  return random().toString(36).substring(2, 7);
}

export default function createDirectLineEmulator(store, { autoConnect = true } = {}) {
  if (!store) {
    throw new Error('"store" argument must be provided when calling createDirectLineEmulator().');
  }

  const now = Date.now();
  const connectedDeferred = createDeferred();
  const connectionStatusDeferredObservable = createDeferredObservable(() => {
    connectionStatusDeferredObservable.next(0);
  });
  const activityDeferredObservable = createDeferredObservable(async () => {
    connectionStatusDeferredObservable.next(1);

    await connectedDeferred.promise;
    connectionStatusDeferredObservable.next(2);
  });

  const postActivityCallDeferreds = [];
  const postActivity = outgoingActivity => {
    const returnPostActivityDeferred = createDeferred();

    const deferred = postActivityCallDeferreds.shift();

    if (!deferred) {
      throw new Error(
        'When DirectLineEmulator is installed, you must call actPostActivity() before sending a message.'
      );
    }

    deferred.resolve({ outgoingActivity, returnPostActivityDeferred });

    return new Observable(observer => {
      (async function () {
        try {
          observer.next(await returnPostActivityDeferred.promise);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  };

  const actPostActivity = async fn => {
    const postActivityCallDeferred = createDeferred();

    postActivityCallDeferreds.push(postActivityCallDeferred);

    await fn();

    const { outgoingActivity, returnPostActivityDeferred } = await postActivityCallDeferred.promise;
    const id = uniqueId();

    const echoBackActivity = { ...outgoingActivity, id, timestamp: getTimestamp() };

    const echoBack = async updater => {
      activityDeferredObservable.next(typeof updater === 'function' ? updater(echoBackActivity) : echoBackActivity);

      await became(
        'echo back activity appears in the store',
        () => store.getState().activities.find(activity => activity.id === id),
        1000
      );
    };

    const rejectPostActivity = error => returnPostActivityDeferred.reject(error);
    const resolvePostActivity = () => returnPostActivityDeferred.resolve(id);

    const resolveAll = async updater => {
      await echoBack(updater);
      resolvePostActivity();
    };

    return { echoBack, rejectPostActivity, resolveAll, resolvePostActivity };
  };

  autoConnect && connectedDeferred.resolve();

  return {
    activity$: shareObservable(activityDeferredObservable.observable),
    actPostActivity,
    connectionStatus$: shareObservable(connectionStatusDeferredObservable.observable),
    end: () => {
      // This is a mock and will no-op on dispatch().
    },
    postActivity,
    emulateConnected: connectedDeferred.resolve,
    emulateIncomingActivity: async activity => {
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
            : typeof timestamp === 'undefined'
            ? getTimestamp()
            : timestamp
        );
        activity = updateIn(activity, ['type'], type => type || 'message');
      }

      const { id } = activity;

      activityDeferredObservable.next(activity);

      await became(
        'incoming activity appears in the store',
        () => store.getState().activities.find(activity => activity.id === id),
        1000
      );
    },
    emulateOutgoingActivity: activity =>
      actPostActivity(() =>
        store.dispatch({
          meta: { method: 'code' },
          payload: { activity },
          type: 'DIRECT_LINE/POST_ACTIVITY'
        })
      )
  };
}
