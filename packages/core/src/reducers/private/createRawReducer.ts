import { type Action } from 'redux';
import { safeParse } from 'valibot';

import { SET_RAW_STATE, setRawStateActionSchema, type SetRawStateAction } from '../../internal/actions/setRawState';

function createRawReducer<TState>(name: SetRawStateAction['payload']['name'], defaultState: TState) {
  return (state: TState = defaultState, action: Action): TState => {
    if (action.type === SET_RAW_STATE) {
      const { output, success } = safeParse(setRawStateActionSchema, action);

      if (success && output.payload.name === name) {
        return output.payload.state as TState;
      }
    }

    return state;
  };
}

export default createRawReducer;
