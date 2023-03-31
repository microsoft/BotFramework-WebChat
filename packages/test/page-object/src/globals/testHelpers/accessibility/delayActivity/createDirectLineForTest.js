import createDeferredObservable from '../../../../utils/createDeferredObservable';
import shareObservable from '../../shareObservable';

export default function createDirectLineForTest({
  ponyfill: { Date } = { Date: window.Date },
  withReplyToId = true
} = {}) {
  const connectionStatusDeferred$ = createDeferredObservable(observer => observer.next(0));
  const activityDeferred$ = createDeferredObservable(() => {
    connectionStatusDeferred$.next(1);
    connectionStatusDeferred$.next(2);
  });

  const echoBackQueue = [];
  const releaseEchoBackOnce = () => {
    const echoBack = echoBackQueue.shift();

    echoBack && echoBack();
  };

  const directLine = {
    activity$: shareObservable(activityDeferred$.observable),
    connectionStatus$: shareObservable(connectionStatusDeferred$.observable),
    numActivities: 0,
    botSendMessage: activity => {
      activityDeferred$.next({
        from: {
          role: 'bot'
        },
        id: Math.random().toString(36).substr(2, 10),
        timestamp: new Date().toISOString(),
        type: 'message',
        ...activity
      });
    },
    postActivity: activity => {
      const id = Math.random().toString(36).substr(2, 10);
      const now = Date.now();
      const timestamp = new Date(now).toISOString();
      const postActivityDeferred$ = createDeferredObservable();

      activityDeferred$.next({
        from: {
          role: 'bot'
        },
        id: Math.random().toString(36).substr(2, 10),
        text: `You said: ${activity.text}`,
        timestamp: new Date(now + 1).toISOString(),
        type: 'message',
        ...(withReplyToId ? { replyToId: id } : {})
      });

      directLine.numActivities++;

      echoBackQueue.push(() => {
        activityDeferred$.next({
          ...activity,
          from: {
            role: 'user'
          },
          id,
          timestamp
        });

        directLine.numActivities++;

        postActivityDeferred$.next(id);
        postActivityDeferred$.complete();
      });

      return postActivityDeferred$.observable;
    },
    releaseEchoBackOnce
  };

  return directLine;
}
