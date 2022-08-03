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

export default function createDirectLineEmulator(store) {
  if (!store) {
    throw new Error('"store" argument must be provided when calling createDirectLineEmulator().');
  }

  const now = Date.now();
  const connectionStatusDeferredObservable = createDeferredObservable(() => {
    connectionStatusDeferredObservable.next(0);
  });
  const activityDeferredObservable = createDeferredObservable(() => {
    connectionStatusDeferredObservable.next(1);
    connectionStatusDeferredObservable.next(2);
  });

  const postActivityCallDeferreds = [];
  const postActivity = outgoingActivity => {
    const returnPostActivityDeferred = createDeferred();

    postActivityCallDeferreds.shift().resolve({ outgoingActivity, returnPostActivityDeferred });

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

  return {
    activity$: shareObservable(activityDeferredObservable.observable),
    connectionStatus$: shareObservable(connectionStatusDeferredObservable.observable),
    end: () => {
      // This is a mock and will no-op on dispatch().
    },
    postActivity,
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
        activity = updateIn(activity, ['timestamp'], timestamp =>
          typeof timestamp === 'number' ? new Date(now + timestamp).toISOString() : timestamp
        );
      }

      const { id } = activity;

      activityDeferredObservable.next(activity);

      await became(
        'incoming activity appears in the store',
        () => store.getState().activities.find(activity => activity.id === id),
        1000
      );
    },
    emulateOutgoingActivity: async activity => {
      if (typeof activity === 'string') {
        activity = {
          from: { id: 'user', role: 'user' },
          text: activity,
          type: 'message'
        };
      }

      const postActivityCallDeferred = createDeferred();

      postActivityCallDeferreds.push(postActivityCallDeferred);

      store.dispatch({
        meta: { method: 'code' },
        payload: { activity },
        type: 'DIRECT_LINE/POST_ACTIVITY'
      });

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
    }
  };
}
