import { type Action } from 'redux';
import { safeParse } from 'valibot';

import { SET_RAW_STATE, setRawStateActionSchema, type SetRawStateAction } from '../../internal/actions/setRawState';

function createRawReducer<TState>(name: SetRawStateAction['payload']['name'], defaultState: TState) {
  return (state: TState = defaultState, action: Action): TState => {
    if (action.type === SET_RAW_STATE) {
      const result = safeParse(setRawStateActionSchema, action);

      if (result.success) {
        if (result.output.payload.name === name) {
          return result.output.payload.state as TState;
        }
      } else {
        console.warn(
          `botframework-webchat: Received action of type "${action.type}" but its content is not valid, ignoring.`,
          { result }
        );
      }
    }

    return state;
  };
}

export default createRawReducer;
