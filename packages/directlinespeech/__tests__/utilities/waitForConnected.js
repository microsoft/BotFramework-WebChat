import createDeferred from 'p-defer-es5';

export default function waitForConnected(directLine) {
  const connectedDeferred = createDeferred();
  const subscription = directLine.connectionStatus$.subscribe({
    error: error => connectedDeferred.reject(error),
    next: value => {
      if (value === 2) {
        connectedDeferred.resolve();
      } else if (value === 4) {
        connectedDeferred.reject(new Error('Disconnected from Direct Line Speech.'));
      }
    }
  });

  return connectedDeferred.promise.then(
    () => {
      subscription.unsubscribe();
    },
    error => {
      subscription.unsubscribe();

      return Promise.reject(error);
    }
  );
}
