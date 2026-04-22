/* eslint-env browser */

import Observable from 'https://esm.sh/core-js/features/observable';

function removeInline(array, searchElement) {
  const index = array.indexOf(searchElement);

  ~index && array.splice(index, 1);
}

function createDeferredObservable(subscribe) {
  const observers = [];
  const observable = new Observable(observer => {
    const unsubscribe = subscribe && subscribe(observer);

    observers.push(observer);

    return () => {
      removeInline(observers, observer);

      unsubscribe && unsubscribe();
    };
  });

  return {
    complete: () => observers.forEach(observer => observer.complete()),
    error: error => observers.forEach(observer => observer.error(error)),
    next: value => observers.forEach(observer => observer.next(value)),
    observable
  };
}

function shareObservable(observable) {
  const observers = [];
  let subscription;

  return new Observable(observer => {
    observers.push(observer);

    if (!subscription) {
      subscription = observable.subscribe({
        complete: () => observers.forEach(observer => observer.complete()),
        error: err => observers.forEach(observer => observer.error(err)),
        next: value => observers.forEach(observer => observer.next(value))
      });
    }

    return () => {
      const index = observers.indexOf(observer);

      ~index && observers.splice(index, 1);

      if (!observers.length) {
        subscription.unsubscribe();
        subscription = null;
      }
    };
  });
}

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
    postActivity: () =>
      new Observable(observer =>
        observer.error(new Error('Post activity is not supported by static chat history chat adapter'))
      )
  };
}
