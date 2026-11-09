// A scripted Direct Line for the parity specs of the connection and incoming services: it logs every call made to it,
// in order (subscribe/unsubscribe per observable and per subscription, `setUserId()`, `end()`).

type Observer<T> = { next?: (value: T) => void };

type MockObservable<T> = {
  readonly emit: (value: T) => void;
  readonly observable: { subscribe(observer: Observer<T>): { unsubscribe(): void } };
  readonly size: () => number;
};

type MockDirectLineInit = {
  /** Name in the call log, e.g. "dl1". */
  readonly name: string;
  /** Called after each new `activity$` subscription, with the number of subscriptions (e.g. the html2 emulator). */
  readonly onActivitySubscribe?: ((mock: MockDirectLine, count: number) => void) | undefined;
  readonly referenceGrammarId?: string | undefined;
  /** Like a `BehaviorSubject`: a new `connectionStatus$` subscription receives the current status (DirectLineJS). */
  readonly replayStatus?: boolean | undefined;
  /** Without `setUserId()`, as some chat adapters. */
  readonly noSetUserId?: boolean | undefined;
  readonly token?: string | undefined;
};

type MockDirectLine = {
  readonly calls: string[];
  readonly directLine: any;
  readonly emitActivity: (activity: unknown) => void;
  readonly emitStatus: (status: number) => void;
  readonly name: string;
  readonly setReferenceGrammarId: (value: string | undefined) => void;
  readonly status: () => number;
};

function createMockObservable<T>(
  log: (message: string) => void,
  name: string,
  onSubscribe?: (observer: Observer<T>, count: number) => void
): MockObservable<T> {
  const observers = new Set<Observer<T>>();
  let count = 0;

  return Object.freeze({
    emit: (value: T) => {
      for (const observer of Array.from(observers)) {
        // An observer unsubscribed during the emission does not receive the value.
        observers.has(observer) && observer.next?.(value);
      }
    },
    observable: Object.freeze({
      subscribe(observer: Observer<T>) {
        const id = ++count;
        let closed = false;

        log(`${name}.subscribe#${id}`);
        observers.add(observer);
        onSubscribe?.(observer, id);

        return Object.freeze({
          unsubscribe() {
            // As an observable, the teardown runs once.
            if (!closed) {
              closed = true;
              observers.delete(observer);
              log(`${name}.unsubscribe#${id}`);
            }
          }
        });
      }
    }),
    size: () => observers.size
  });
}

export default function createMockDirectLine(calls: string[], init: MockDirectLineInit): MockDirectLine {
  const { name, noSetUserId, onActivitySubscribe, replayStatus, token } = init;
  const log = (message: string) => calls.push(`${name}.${message}`);
  let { referenceGrammarId } = init;
  let status = 0;

  // eslint-disable-next-line prefer-const
  let mock: MockDirectLine;

  const connectionStatus = createMockObservable<number>(log, 'connectionStatus$', observer => {
    replayStatus && observer.next?.(status);
  });

  const activity = createMockObservable<unknown>(log, 'activity$', (_, count) => onActivitySubscribe?.(mock, count));

  const directLine: any = {
    activity$: activity.observable,
    connectionStatus$: connectionStatus.observable,
    end: () => log('end()'),
    get referenceGrammarId() {
      return referenceGrammarId;
    },
    token
  };

  noSetUserId || (directLine.setUserId = (userID: unknown) => log(`setUserId(${JSON.stringify(userID)})`));

  mock = Object.freeze({
    calls,
    directLine,
    emitActivity: (value: unknown) => activity.emit(value),
    emitStatus: (value: number) => {
      status = value;
      connectionStatus.emit(value);
    },
    name,
    setReferenceGrammarId: (value: string | undefined) => {
      referenceGrammarId = value;
    },
    status: () => status
  });

  return mock;
}

export type { MockDirectLine, MockDirectLineInit };
