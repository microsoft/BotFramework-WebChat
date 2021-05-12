import Observable from 'core-js/features/observable';

function removeInline(array, searchElement) {
  const index = array.indexOf(searchElement);

  ~index && array.splice(index, 1);
}

export default function createDeferredObservable(subscribe) {
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
