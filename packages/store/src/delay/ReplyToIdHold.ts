import { function_, is, looseObject, number, object, optional, parse, pipe, readonly, string } from 'valibot';

// Ported from `packages/core/src/sagas/queueIncomingActivitySaga.ts`.
//
// Source-side buffering: a held activity is not in the graph until it is released, so it cannot change the order or
// the positions of other messages, the same as in core where it is not in the Redux state until released.

/** Same as core: hold a reply for up to 5 seconds. */
const DEFAULT_TIMEOUT = 5_000;

const replyToIdHoldInitSchema = pipe(
  object({
    /** Defaults to the global `setTimeout`/`clearTimeout`; pass a fake clock in tests, same as core's ponyfill. */
    clock: optional(
      pipe(
        object({
          clearTimeout: function_(),
          setTimeout: function_()
        }),
        readonly()
      )
    ),
    /**
     * Returns `true` if the transcript has the activity replied to, or another reply to it (we already waited for the
     * same missing activity once).
     */
    hasReplyTarget: function_(),
    /**
     * Returns `true` if replies should be held. Core holds only after the first bot activity is shown, because the
     * first bot activity usually replies to an activity that is never shown.
     */
    isHoldEnabled: function_(),
    /** Called once per activity, in release order, e.g. to upsert it into the store in a transaction. */
    release: function_(),
    timeout: optional(number(), DEFAULT_TIMEOUT)
  }),
  readonly()
);

// Method syntax on purpose: the handle type is opaque, so both the global timers and a fake clock fit.
type Clock = {
  clearTimeout(handle: unknown): void;
  setTimeout(callback: () => void, timeout: number): unknown;
};

// Typed here, checked at runtime by `replyToIdHoldInitSchema`.
type ReplyToIdHoldInit<T> = {
  readonly clock?: Clock | undefined;
  readonly hasReplyTarget: (replyToId: string) => boolean;
  readonly isHoldEnabled: () => boolean;
  readonly release: (activity: T) => void;
  readonly timeout?: number | undefined;
};

const replyActivitySchema = looseObject({ replyToId: string() });

type HeldEntry<T> = {
  readonly activity: T;
  readonly replyToId: string;
  readonly timeoutHandle: unknown;
};

/**
 * Holds an incoming activity that replies to an activity not in the transcript yet (`replyToId`), until that activity
 * is released or the timeout expires. Other activities pass through immediately and can overtake held ones.
 *
 * This is an accessibility fix: a screen reader reads the reply after the activity it replies to.
 */
class ReplyToIdHold<T> {
  constructor(init: ReplyToIdHoldInit<T>) {
    // Validates the shape, the typed functions are read from `init`.
    const { timeout } = parse(replyToIdHoldInitSchema, init);
    const { clock, hasReplyTarget, isHoldEnabled, release } = init;

    this.#clock = clock ?? globalThis;
    this.#hasReplyTarget = hasReplyTarget;
    this.#isHoldEnabled = isHoldEnabled;
    this.#release = release;
    this.#timeout = timeout;
  }

  #clock: Clock;
  #closed = false;
  #hasReplyTarget: (replyToId: string) => boolean;
  #heldEntries: HeldEntry<T>[] = [];
  #isHoldEnabled: () => boolean;
  #release: (activity: T) => void;
  #timeout: number;

  /** Releases held activities whose target is now in the transcript, in arrival order, until none is left. */
  #releaseReady(): void {
    for (;;) {
      const index = this.#heldEntries.findIndex(({ replyToId }) => this.#hasReplyTarget(replyToId));

      if (!~index) {
        break;
      }

      for (const { activity, timeoutHandle } of this.#heldEntries.splice(index, 1)) {
        this.#clock.clearTimeout(timeoutHandle);
        this.#release(activity);
      }
    }
  }

  #releaseOnTimeout(activity: T, replyToId: string): void {
    const index = this.#heldEntries.findIndex(entry => entry.activity === activity);

    if (!~index) {
      return;
    }

    console.warn(
      `botframework-webchat: Timed out while waiting for activity "${replyToId}" which an activity is replying to.`,
      { activity, replyToId }
    );

    this.#heldEntries.splice(index, 1);
    this.#release(activity);
    this.#releaseReady();
  }

  /** Number of activities on hold. */
  get size(): number {
    return this.#heldEntries.length;
  }

  /** Drops held activities and stops their timers, e.g. on disconnect (core cancels the saga). */
  close(): void {
    this.#closed = true;

    for (const { timeoutHandle } of this.#heldEntries.splice(0)) {
      this.#clock.clearTimeout(timeoutHandle);
    }
  }

  push(activity: T): void {
    if (this.#closed) {
      throw new Error('botframework-webchat: Cannot push to a closed ReplyToIdHold');
    }

    if (is(replyActivitySchema, activity)) {
      const { replyToId } = activity;

      if (replyToId && this.#isHoldEnabled() && !this.#hasReplyTarget(replyToId)) {
        this.#heldEntries.push(
          Object.freeze({
            activity,
            replyToId,
            timeoutHandle: this.#clock.setTimeout(() => this.#releaseOnTimeout(activity, replyToId), this.#timeout)
          })
        );

        return;
      }
    }

    this.#release(activity);
    this.#releaseReady();
  }
}

export default ReplyToIdHold;
export { DEFAULT_TIMEOUT, type ReplyToIdHoldInit };
