import type { MachineAction } from '../machines/types';
import { getInitialState } from './createDefaultModeReducers';
import type { ReducerGroup } from './createDefaultEngine';

/** A reducer group outside React (no reader re-renders on it): its state, reduced at each `dispatch()`. */
export default function createReducerGroup<S extends object>(
  reducer: (state: S | undefined, action: MachineAction) => S
): ReducerGroup & { readonly getState: () => S } {
  let state = getInitialState(reducer);

  return Object.freeze({
    dispatch: (action: MachineAction) => {
      state = reducer(state, action);
    },
    getState: () => state
  });
}
