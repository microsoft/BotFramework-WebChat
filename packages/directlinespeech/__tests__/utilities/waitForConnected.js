import withResolvers from '../../src/utils/withResolvers';

export default function waitForConnected(directLine) {
  const connectedWithResolvers = withResolvers();
  const subscription = directLine.connectionStatus$.subscribe({
    error: error => connectedWithResolvers.reject(error),
    next: value => {
      if (value === 2) {
        connectedWithResolvers.resolve();
      } else if (value === 4) {
        connectedWithResolvers.reject(new Error('Disconnected from Direct Line Speech.'));
      }
    }
  });

  return connectedWithResolvers.promise.then(
    () => {
      subscription.unsubscribe();
    },
    error => {
      subscription.unsubscribe();

      return Promise.reject(error);
    }
  );
}
