import Observable from 'core-js/features/observable';
import updateIn from 'simple-update-in';

import createDeferredObservable from '../../utils/createDeferredObservable';
import loadTranscriptAsset from '../../utils/loadTranscriptAsset';
import shareObservable from './shareObservable';

function createUpdateRelativeTimestamp(now) {
  return activity => {
    if (typeof activity === 'string') {
      activity = {
        from: {
          id: 'bot',
          role: 'bot'
        },
        id: Math.random().toString(36).substr(2, 5),
        text: activity,
        timestamp: 0,
        type: 'message'
      };
    }

    if (typeof activity.localTimestamp === 'number') {
      activity = updateIn(activity, ['localTimestamp'], localTimestamp =>
        new Date(now + localTimestamp || 0).toISOString()
      );
    }

    if (typeof activity.timestamp === 'number') {
      activity = updateIn(activity, ['timestamp'], timestamp => new Date(now + timestamp || 0).toISOString());
    }

    return activity;
  };
}

export default function createDirectLineWithTranscript(activitiesOrFilename, { overridePostActivity } = {}) {
  const now = Date.now();
  const patchActivity = createUpdateRelativeTimestamp(now);
  const connectionStatusDeferredObservable = createDeferredObservable(() => {
    connectionStatusDeferredObservable.next(0);
  });
  const activityDeferredObservable = createDeferredObservable(() => {
    (async function () {
      connectionStatusDeferredObservable.next(1);
      connectionStatusDeferredObservable.next(2);

      const activities = (
        !activitiesOrFilename
          ? []
          : Array.isArray(activitiesOrFilename)
          ? activitiesOrFilename
          : await loadTranscriptAsset(activitiesOrFilename)
      ).map(patchActivity);

      setTimeout(() => {
        activities.forEach(activity => activityDeferredObservable.next(activity));
      }, 100);
    })();
  });

  return {
    activity$: shareObservable(activityDeferredObservable.observable),
    activityDeferredObservable: {
      ...activityDeferredObservable,

      next(activity) {
        return activityDeferredObservable.next(patchActivity(activity));
      }
    },
    connectionStatus$: shareObservable(connectionStatusDeferredObservable.observable),
    connectionStatusDeferredObservable,
    end: () => {
      // This is a mock and will no-op on dispatch().
    },
    postActivity: activity => {
      if (overridePostActivity) {
        return overridePostActivity(activity);
      }

      const id = Math.random().toString(36).substring(2, 7);

      activityDeferredObservable.next(
        patchActivity({
          ...activity,
          id,
          timestamp: new Date().toISOString()
        })
      );

      return Observable.from([id]);
    }
  };
}
