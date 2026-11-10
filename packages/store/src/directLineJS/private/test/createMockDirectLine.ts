import type { DirectLineJSBotConnection } from '../../DirectLineJSStore.ts';

type Observer = Parameters<DirectLineJSBotConnection['activity$']['subscribe']>[0];

/**
 * Creates a mock of DirectLineJS bot connection, call `emitActivity()` to emit an activity on `activity$`.
 */
function createMockDirectLine(): {
  readonly directLine: DirectLineJSBotConnection;
  readonly emitActivity: (activity: unknown) => void;
} {
  const observers = new Set<Observer>();

  return Object.freeze({
    directLine: Object.freeze({
      activity$: Object.freeze({
        subscribe(observer: Observer) {
          observers.add(observer);

          return Object.freeze({ unsubscribe: () => observers.delete(observer) });
        }
      })
    }),
    emitActivity: (activity: unknown) => {
      for (const observer of observers) {
        observer.next(activity);
      }
    }
  });
}

export default createMockDirectLine;
