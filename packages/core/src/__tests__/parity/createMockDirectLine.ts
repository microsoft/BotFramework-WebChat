// A scripted Direct Line for the parity specs of the services: it logs every call made to it, in order
// (subscribe/unsubscribe per observable and per subscription, `setUserId()`, `end()`, `postActivity()`), and lets the
// script answer each `postActivity()` call (value, complete, error) and echo the posted activity back on `activity$`.

type Observer<T> = { complete?: () => void; error?: (error: unknown) => void; next?: (value: T) => void };

/** One call to `postActivity()`: the activity posted, and the controls of the observable it returned. */
type MockPost = {
  readonly activity: any;
  /** Completes the observable returned (without a value if `next()` was not called). */
  readonly complete: () => void;
  /**
   * Emits the posted activity on `activity$`, as the service does: with an `id` (`a<n>` by default) and a timestamp
   * (`<n>` seconds), then the patch.
   */
  readonly echo: (patch?: Readonly<Record<string, unknown>>) => void;
  readonly error: (error: unknown) => void;
  /** Emits the activity ID (`a<n>` by default) on the observable returned. */
  readonly next: (id?: string) => void;
};

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
  /** Without `end()`, as some chat adapters (calling it throws a `TypeError`). */
  readonly noEnd?: boolean | undefined;
  /** The observable returned by `postActivity()` emits the activity ID and completes when subscribed (e.g. the voice posts of the html2 emulator). */
  readonly postReturnsOnSubscribe?: boolean | undefined;
  readonly token?: string | undefined;
};

type MockDirectLine = {
  readonly directLine: any;
  readonly emitActivity: (activity: unknown) => void;
  readonly emitStatus: (status: number) => void;
  readonly name: string;
  /** The call to `postActivity()` number `n` (from 1). */
  readonly post: (n: number) => MockPost;
  /** How many times `postActivity()` was called. */
  readonly postCount: () => number;
  /** The posted activities not read yet by the recorder, in order. */
  readonly takePosted: () => unknown[];
  readonly setReferenceGrammarId: (value: string | undefined) => void;
  /** The next calls to `postActivity()` throw (synchronously). */
  readonly setPostThrows: (value: boolean) => void;
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

function deepCopy(value: any): any {
  if (Array.isArray(value)) {
    return value.map(deepCopy);
  } else if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, deepCopy(item)]));
  }

  return value;
}

/** Where the calls are logged, in order: an array, or anything with `push()`. */
type CallLog = { push(message: string): unknown };

export default function createMockDirectLine(calls: CallLog, init: MockDirectLineInit): MockDirectLine {
  const { name, noEnd, noSetUserId, onActivitySubscribe, postReturnsOnSubscribe, replayStatus, token } = init;
  const log = (message: string) => calls.push(`${name}.${message}`);
  const posted: unknown[] = [];
  const posts: MockPost[] = [];
  let postThrows = false;
  let { referenceGrammarId } = init;
  let status = 0;

  // eslint-disable-next-line prefer-const
  let mock: MockDirectLine;

  const connectionStatus = createMockObservable<number>(log, 'connectionStatus$', observer => {
    replayStatus && observer.next?.(status);
  });

  const activity = createMockObservable<unknown>(log, 'activity$', (_, count) => onActivitySubscribe?.(mock, count));

  const postActivity = (outgoing: any) => {
    const n = posts.length + 1;

    log(`postActivity#${n}`);

    // A deep copy (keys with `undefined` kept): what was posted, even if the caller changes the object later.
    const activityPosted = deepCopy(outgoing);
    const observers = new Set<Observer<string>>();
    let count = 0;

    posted.push(activityPosted);

    const post: MockPost = Object.freeze({
      activity: activityPosted,
      complete: () => {
        log(`post#${n}.complete()`);
        Array.from(observers).forEach(observer => observers.has(observer) && observer.complete?.());
      },
      echo: (patch: Readonly<Record<string, unknown>> = {}) =>
        activity.emit({
          ...activityPosted,
          id: `a${n}`,
          // eslint-disable-next-line no-magic-numbers, no-restricted-globals
          timestamp: new Date(n * 1_000).toISOString(),
          ...patch
        }),
      error: (error: unknown) => {
        log(`post#${n}.error()`);
        Array.from(observers).forEach(observer => observers.has(observer) && observer.error?.(error));
      },
      next: (id = `a${n}`) => {
        log(`post#${n}.next(${id})`);
        Array.from(observers).forEach(observer => observers.has(observer) && observer.next?.(id));
      }
    });

    posts.push(post);

    // The call counts, as the activity passed: `post(n)` is the call number `n`.
    if (postThrows) {
      throw new Error(`postActivity#${n} throws`);
    }

    return Object.freeze({
      subscribe(observer: Observer<string>) {
        const id = ++count;
        let closed = false;

        log(`post#${n}.subscribe#${id}`);
        observers.add(observer);

        if (postReturnsOnSubscribe) {
          post.next();
          post.complete();
        }

        return Object.freeze({
          unsubscribe() {
            if (!closed) {
              closed = true;
              observers.delete(observer);
              log(`post#${n}.unsubscribe#${id}`);
            }
          }
        });
      }
    });
  };

  const directLine: any = {
    activity$: activity.observable,
    connectionStatus$: connectionStatus.observable,
    postActivity,
    get referenceGrammarId() {
      return referenceGrammarId;
    },
    token
  };

  noEnd || (directLine.end = () => log('end()'));
  noSetUserId || (directLine.setUserId = (userID: unknown) => log(`setUserId(${JSON.stringify(userID)})`));

  mock = Object.freeze({
    directLine,
    emitActivity: (value: unknown) => activity.emit(value),
    emitStatus: (value: number) => {
      status = value;
      connectionStatus.emit(value);
    },
    name,
    post: (n: number) => {
      const post = posts[n - 1];

      if (!post) {
        throw new Error(`${name}: postActivity() was not called ${n} times`);
      }

      return post;
    },
    postCount: () => posts.length,
    setPostThrows: (value: boolean) => {
      postThrows = value;
    },
    setReferenceGrammarId: (value: string | undefined) => {
      referenceGrammarId = value;
    },
    status: () => status,
    takePosted: () => posted.splice(0)
  });

  return mock;
}

export type { MockDirectLine, MockDirectLineInit, MockPost };
