import createDeferredObservable from './createDeferredObservable';
import loadTranscriptAsset from './loadTranscriptAsset';
import shareObservable from './shareObservable';

function updateRelativeTimestamp(now, activity) {
  return {
    ...activity,

    ...(activity.from.role === 'user' &&
    activity.channelData &&
    typeof activity.channelData.clientTimestamp === 'number'
      ? {
          channelData: {
            ...activity.channelData,
            clientTimestamp: new Date(now + (activity.channelData.clientTimestamp || 0)).toISOString()
          }
        }
      : {}),

    ...(typeof activity.timestamp === 'number'
      ? { timestamp: new Date(now + (activity.timestamp || 0)).toISOString() }
      : {})
  };
}

export default function createDirectLineWithTranscript(activitiesOrFilename) {
  const now = Date.now();
  const patchActivity = updateRelativeTimestamp.bind(null, now);
  const connectionStatusDeferredObservable = createDeferredObservable(() => {
    connectionStatusDeferredObservable.next(0);
  });

  const activityDeferredObservable = createDeferredObservable(() => {
    (async function() {
      connectionStatusDeferredObservable.next(1);
      connectionStatusDeferredObservable.next(2);

      const activities = (Array.isArray(activitiesOrFilename)
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
    end: () => {},
    postActivity: () => {}
  };
}
