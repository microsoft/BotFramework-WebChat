import { DICTATING, IDLE, STARTING, STOPPING, WILL_START } from '../../constants/DictateState';

/** What changes the dictate state, besides setting it: `START_DICTATE` and `STOP_DICTATE`. */
type DictateOperation = 'start' | 'stop';

/**
 * The next dictate state after starting or stopping the dictation, as the `dictateState` reducer:
 *
 * - start: from idle, stopping or "will start", starting; otherwise unchanged;
 * - stop: from starting or dictating, stopping; from "will start", idle (the automatic start is cancelled); otherwise
 *   unchanged.
 */
export default function nextDictateState(state: number, operation: DictateOperation): number {
  if (operation === 'start') {
    return state === IDLE || state === STOPPING || state === WILL_START ? STARTING : state;
  }

  return state === STARTING || state === DICTATING ? STOPPING : state === WILL_START ? IDLE : state;
}

export type { DictateOperation };
