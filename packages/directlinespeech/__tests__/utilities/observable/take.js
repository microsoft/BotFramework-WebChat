export default function take(observable, count) {
  return new Observable(observer => {
    const subscription = observable.subscribe({
      complete() {
        observer.complete();
      },
      error(error) {
        observer.error(error);
      },
      next(value) {
        observer.next(value);

        if (!--count) {
          observer.complete();
          subscription.unsubscribe();
        }
      }
    });
  });
}
