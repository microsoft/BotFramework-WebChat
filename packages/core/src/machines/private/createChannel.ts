import type { MachineAction, Match } from '../types';

type Taker = {
  cancelled: boolean;
  readonly match: Match;
  readonly then: (action: MachineAction) => void;
};

type Channel = {
  /** Calls the takers that match the action, each once, in the order they started waiting. */
  readonly put: (action: MachineAction) => void;
  /** Waits for the next action that matches, at the end of the list; returns the function that stops waiting. */
  readonly take: (match: Match, then: (action: MachineAction) => void) => () => void;
};

// The actions put by a machine, as the `SAGA_ACTION` symbol redux-saga sets on them: by identity, for good, for every
// store (a host that passes the same object on later passes it marked).
const putActions = new WeakSet<object>();

/** Marks an action as put by a machine: its takers run when it is reduced, not after the current task. */
export function markPut(action: MachineAction): void {
  putActions.add(action);
}

export function isPut(action: MachineAction): boolean {
  return putActions.has(action);
}

/**
 * The takers of the machines, as the channel of redux-saga: one list for every machine; a taker called is removed, and
 * a machine that waits again does so at the end of the list. An action goes to the takers waiting when it arrives; a
 * matcher is called even for a taker stopped meanwhile (not called back), and a matcher that throws stops the action.
 */
export default function createChannel(): Channel {
  let takers: Taker[] = [];

  return Object.freeze({
    put: (action: MachineAction) => {
      for (const taker of takers) {
        if (taker.match(action) && !taker.cancelled) {
          taker.cancelled = true;
          takers = takers.filter(other => other !== taker);
          taker.then(action);
        }
      }
    },
    take: (match: Match, then: (action: MachineAction) => void) => {
      const taker: Taker = { cancelled: false, match, then };

      takers = [...takers, taker];

      return () => {
        if (!taker.cancelled) {
          taker.cancelled = true;
          takers = takers.filter(other => other !== taker);
        }
      };
    }
  });
}

export type { Channel };
