import type { ActivitiesStore } from '@msinternal/botframework-webchat-core-activities';

import sagaError from '../actions/sagaError';
import createMachines from '../machines/createMachines';
import type { MachineAction } from '../machines/types';
import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import applyActivitiesAction from './applyActivitiesAction';

/** A reducer group holding its state: `useEagerReducer()` in the api, or a plain object outside React. */
type ReducerGroup = {
  readonly dispatch: (action: MachineAction) => void;
  readonly getState: () => object;
};

type DefaultEngine = {
  /** As `dispatch()` of the Redux store: the reducers, then the machines. Returns the action. */
  readonly dispatch: (action: MachineAction) => MachineAction;
  /** As `getState()` of the Redux store, with the keys that default mode has (what the machines select). */
  readonly getState: () => Readonly<Record<string, unknown>>;
  /** Starts the machines, as the Redux store does when it is created. */
  readonly start: () => void;
  /** Stops the machines. */
  readonly stop: () => void;
};

/**
 * Web Chat without Redux: the reducer groups and the activities store hold the state, and the machines of Redux mode
 * (`createMachines()`) take, select and put the same actions.
 *
 * An action is reduced by the activities store and every group within one `batch()` (in React, one render for every
 * group that changed), then goes to the machines: the order of a Redux store with its machines middleware. When the
 * reducing throws, the machines do not get the action, as when a reducer of the Redux store throws.
 *
 * Creating the engine does nothing else: the machines take actions after `start()`.
 */
export default function createDefaultEngine({
  activitiesStore,
  batch,
  groups,
  ponyfill,
  wrapDispatch
}: {
  readonly activitiesStore: ActivitiesStore;
  /** Runs the reducing of one action, e.g. `unstable_batchedUpdates()` of React. */
  readonly batch: (fn: () => void) => void;
  readonly groups: readonly ReducerGroup[];
  readonly ponyfill: GlobalScopePonyfill;
  /**
   * For tests only: wraps `dispatch()`, for the actions of the caller and those the machines put, as the outermost
   * middleware of a Redux store.
   */
  readonly wrapDispatch?:
    | ((dispatch: (action: MachineAction) => MachineAction) => (action: MachineAction) => MachineAction)
    | undefined;
}): DefaultEngine {
  let lastParts: readonly unknown[] = [];
  let lastState: Readonly<Record<string, unknown>> = Object.freeze({});

  // A new object only when a group or the activities changed, as the state of a Redux store.
  const getState = () => {
    const activities = activitiesStore.getSnapshot();
    const parts = [activities, ...groups.map(group => group.getState())];

    if (parts.length !== lastParts.length || parts.some((part, index) => part !== lastParts[+index])) {
      lastParts = parts;
      lastState = Object.freeze(
        Object.assign({}, ...parts.slice(1), {
          activities: activities.sortedActivities,
          groupedActivities: activities
        })
      );
    }

    return lastState;
  };

  // `machines` is set before anything can dispatch: the machines take actions after `start()`.
  // eslint-disable-next-line prefer-const
  let machines: ReturnType<typeof createMachines>;

  const reduceThenTake = (action: MachineAction): MachineAction => {
    batch(() => {
      applyActivitiesAction(activitiesStore, action);

      for (const group of groups) {
        group.dispatch(action);
      }
    });

    machines.afterReduce(action);

    return action;
  };

  const dispatch = wrapDispatch ? wrapDispatch(reduceThenTake) : reduceThenTake;

  machines = createMachines({
    dispatch,
    getState,
    // As the Redux store: an error that no machine catches stops every machine.
    onError: error => {
      console.error(error);
      dispatch(sagaError());
    },
    ponyfill
  });

  return Object.freeze({ dispatch, getState, start: machines.start, stop: machines.stop });
}

export type { DefaultEngine, ReducerGroup };
