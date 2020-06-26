const { createDeferredObservable } = window.WebChatTest;

window.TestAsset = {
  createDirectLineForTest: ({ withReplyToId = true } = {}) => {
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

    return {
      activity$: shareObservable(activityDeferred$.observable),
      connectionStatus$: shareObservable(connectionStatusDeferred$.observable),
      postActivity: activity => {
        const id = Math.random()
          .toString(36)
          .substr(2, 10);
        const now = Date.now();
        const timestamp = new Date(now).toISOString();
        const postActivityDeferred$ = createDeferredObservable();

        activityDeferred$.next({
          from: {
            role: 'bot'
          },
          id: Math.random()
            .toString(36)
            .substr(2, 10),
          text: `You said: ${activity.text}`,
          timestamp: new Date(now + 1).toISOString(),
          type: 'message',
          ...(withReplyToId ? { replyToId: id } : {})
        });

        echoBackQueue.push(() => {
          activityDeferred$.next({
            ...activity,
            from: {
              role: 'user'
            },
            id,
            timestamp
          });

          postActivityDeferred$.next(id);
          postActivityDeferred$.complete();
        });

        return postActivityDeferred$.observable;
      },
      releaseEchoBackOnce
    };
  }
};
