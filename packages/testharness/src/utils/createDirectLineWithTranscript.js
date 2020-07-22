import createDeferredObservable from './createDeferredObservable';
import loadTranscriptAsset from './loadTranscriptAsset';
import shareObservable from './shareObservable';

export default function createDirectLineWithTranscript(activitiesOrFilename) {
  const connectionStatusDeferredObservable = createDeferredObservable(() => {
    connectionStatusDeferredObservable.next(0);
  });

  const activityDeferredObservable = createDeferredObservable(() => {
    (async function() {
      connectionStatusDeferredObservable.next(1);
      connectionStatusDeferredObservable.next(2);

      const now = Date.now();
      const activities = Array.isArray(activitiesOrFilename)
        ? activitiesOrFilename.map(activity => {
            const { timestamp } = activity;

            return {
              ...activity,
              timestamp: typeof timestamp === 'number' ? new Date(now + (timestamp || 0)).toISOString() : timestamp
            };
          })
        : await loadTranscriptAsset(activitiesOrFilename);

      setTimeout(() => {
        activities.forEach(activity => activityDeferredObservable.next(activity));
      }, 100);
    })();
  });

  return {
    activity$: shareObservable(activityDeferredObservable.observable),
    connectionStatus$: shareObservable(connectionStatusDeferredObservable.observable),
    end: () => {},
    postActivity: () => {}
  };
}
