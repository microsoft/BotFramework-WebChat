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

      const activities = Array.isArray(activitiesOrFilename)
        ? activitiesOrFilename
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
