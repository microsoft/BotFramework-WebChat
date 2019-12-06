/* global Observable */

export default function shareObservable(observable) {
  let observers = [];
  let subscription;

  return new Observable(observer => {
    if (!subscription) {
      subscription = observable.subscribe({
        complete() {
          observers.forEach(observer => observer.complete());
        },

        error(err) {
          observers.forEach(observer => observer.error(err));
        },

        next(value) {
          observers.forEach(observer => observer.next(value));
        }
      });
    }

    observers.push(observer);

    return () => {
      observers = observers.filter(o => o !== observer);

      if (!observers.length) {
        subscription.unsubscribe();
        subscription = null;
      }
    };
  });
}
