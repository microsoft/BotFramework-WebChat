import type { WebChatOutgoingActivity } from '../../types/internal/WebChatOutgoingActivity';
import type { WebChatActivity } from '../../types/WebChatActivity';

/**
 * The actions that more than one service waits for, named as their Redux actions: the order of the services reacting
 * to them is the order of the sagas.
 */
type SagaAction =
  | { readonly type: 'POST_ACTIVITY'; readonly activity: WebChatActivity }
  | {
      readonly type: 'POST_ACTIVITY_PENDING';
      readonly activity: WebChatOutgoingActivity;
      readonly method: string;
    }
  | { readonly type: 'SET_DICTATE_INTERIMS' }
  | { readonly type: 'SET_SEND_BOX'; readonly text: string };

type SagaQueue = {
  /**
   * Runs `fn`, then, if it is the outermost `batch()`, the tasks queued by `later()` meanwhile, in order (also those
   * queued by these tasks), before returning.
   */
  readonly batch: <T>(fn: () => T) => T;
  /**
   * Calls the reactions waiting for the action (`onAction()`) that match it, in order. Each one called waits again at
   * the end of the list, as a saga of `takeEvery()` or `takeLatest()` does.
   */
  readonly handleAction: (action: SagaAction) => void;
  /** Inside a `batch()`, queues `fn` after the tasks already queued; outside, runs it now. */
  readonly later: (fn: () => void) => void;
  /** Waits for the actions that match, at the end of the list; returns the function that stops waiting. */
  readonly onAction: (match: (action: SagaAction) => boolean, handle: (action: SagaAction) => void) => () => void;
};

type Reaction = {
  readonly handle: (action: SagaAction) => void;
  readonly match: (action: SagaAction) => boolean;
};

/**
 * The order of redux-saga, for the services that do what the sagas did: one queue for all of them, as the "asap" queue
 * of redux-saga is one queue for every saga.
 *
 * In Redux mode, an action is reduced, then the sagas waiting for it run; what they `put()` is queued, and runs after
 * the current action, one at a time. A saga resumes after its own `put()` ran, so the actions put by the sagas reacting
 * to it come before its next one. Here, an operation of a service is a `batch()`, and each `put()` of a saga is one task
 * queued by `later()`, whose last step is what the saga does next.
 *
 * The sagas waiting for the same action are called in the order they started waiting; one that took an action waits
 * again at the end of the list. So, after an action that only some of them take, the others come first: e.g. after an
 * event is posted, stopping the dictation comes before speaking. `onAction()` and `handleAction()` keep that order.
 */
export default function createSagaQueue(): SagaQueue {
  const queue: (() => void)[] = [];
  const reactions: Reaction[] = [];
  let depth = 0;

  const batch = <T>(fn: () => T): T => {
    depth++;

    try {
      return fn();
    } finally {
      if (!--depth) {
        depth++;

        try {
          while (queue.length) {
            queue.shift()();
          }
        } finally {
          depth--;
        }
      }
    }
  };

  const later = (fn: () => void) => {
    depth ? queue.push(fn) : fn();
  };

  const remove = (reaction: Reaction): boolean => {
    const index = reactions.indexOf(reaction);

    ~index && reactions.splice(index, 1);

    return !!~index;
  };

  return Object.freeze({
    batch,
    handleAction: (action: SagaAction) => {
      for (const reaction of reactions.slice()) {
        // Not if it stopped waiting meanwhile.
        if (reactions.includes(reaction) && reaction.match(action)) {
          remove(reaction);
          reactions.push(reaction);
          reaction.handle(action);
        }
      }
    },
    later,
    onAction: (match: Reaction['match'], handle: Reaction['handle']) => {
      const reaction: Reaction = Object.freeze({ handle, match });

      reactions.push(reaction);

      return () => {
        remove(reaction);
      };
    }
  });
}

export type { SagaAction, SagaQueue };
