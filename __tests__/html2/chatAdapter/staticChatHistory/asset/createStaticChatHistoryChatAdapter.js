/* eslint-env browser */

import Observable from 'https://esm.sh/core-js/features/observable';
import createDeferredObservable from './createDeferredObservable.js';
import shareObservable from './shareObservable.js';

async function waitForIdle() {
  if ('requestIdleCallback' in window && typeof window.requestIdleCallback === 'function') {
    await new Promise(resolve => window.requestAnimationFrame(resolve));
  } else if ('requestAnimationFrame' in window && typeof window.requestAnimationFrame === 'function') {
    await new Promise(resolve => window.requestAnimationFrame(resolve));
  } else {
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

export default function createStaticChatHistoryChatAdapter(chatHistory) {
  const connectionStatusDeferredObservable = createDeferredObservable(() => {
    connectionStatusDeferredObservable.next(0);
  });

  const activityDeferredObservable = createDeferredObservable(observer => {
    connectionStatusDeferredObservable.next(1);
    connectionStatusDeferredObservable.next(2);

    (async () => {
      let count = 0;

      for (const activity of chatHistory) {
        // eslint-disable-next-line no-await-in-loop
        count++ % 10 === 0 && (await waitForIdle());

        observer.next(activity);
      }
    })();
  });

  return {
    activity$: shareObservable(activityDeferredObservable.observable),
    connectionStatus$: shareObservable(connectionStatusDeferredObservable.observable),
    postActivity() {
      return new Observable(observer => {
        observer.error(new Error('Post activity is not supported by static chat history chat adapter'));
      });
    }
  };
}
