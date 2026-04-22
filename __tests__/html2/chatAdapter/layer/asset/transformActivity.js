import Observable from 'https://esm.sh/core-js/features/observable';

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

export default function transformActivity(rawDirectLine, transformer) {
  return {
    ...rawDirectLine,
    activity$: shareObservable(
      new Observable(observer =>
        rawDirectLine.activity$.subscribe({
          complete: () => observer.complete(),
          error: reason => observer.error(reason),
          next: activities => {
            for (const activity of transformer(activities)) {
              observer.next(activity);
            }
          }
        })
      )
    )
  };
}
