import { type Action } from 'redux';
import { parse } from 'valibot';

import { SET_RAW_STATE, setRawStateActionSchema } from '../internal/actions/setRawState';
import { type SuggestedActionsState } from '../internal/types/suggestedActions';

const DEFAULT_STATE: SuggestedActionsState = Object.freeze([]);

function suggestedActions(state: SuggestedActionsState = DEFAULT_STATE, action: Action): SuggestedActionsState {
  if (action.type === SET_RAW_STATE) {
    const parsedAction = parse(setRawStateActionSchema, action);

    if (parsedAction.payload.name === 'suggestedActions') {
      ({ state } = parsedAction.payload);
    }
  }

  return state;
}

export default suggestedActions;
