// Same in every app folder (CI diffs them): a chat adapter for app.js and element.js, which connects at once and receives
// one message from the bot.

// Emits the values on every subscription, asynchronously like DirectLineJS.
function observableOf(...values) {
  return Object.freeze({
    subscribe: ({ next }) => {
      const timeout = setTimeout(() => values.forEach(value => next(value)));

      return Object.freeze({ unsubscribe: () => clearTimeout(timeout) });
    }
  });
}

export default function createFakeDirectLine() {
  return Object.freeze({
    activity$: observableOf({
      from: { id: 'bot', role: 'bot' },
      id: 'a-00001',
      text: 'Hello from the bot.',
      timestamp: new Date().toISOString(),
      type: 'message'
    }),
    connectionStatus$: observableOf(0, 1, 2), // Uninitialized, connecting, online.
    end: () => undefined,
    postActivity: () => observableOf('a-00002')
  });
}
