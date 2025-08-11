import { type Action } from 'redux';
import { parse } from 'valibot';

import { SET_RAW_STATE, setRawStateActionSchema } from '../internal/actions/setRawState';
import { type SuggestedActionsOriginActivityState } from '../internal/types/suggestedActionsOriginActivity';

const DEFAULT_STATE: SuggestedActionsOriginActivityState = Object.freeze({ activity: undefined });

function suggestedActionsOriginActivity(
  state: SuggestedActionsOriginActivityState = DEFAULT_STATE,
  action: Action
): SuggestedActionsOriginActivityState {
  if (action.type === SET_RAW_STATE) {
    const parsedAction = parse(setRawStateActionSchema, action);

    if (parsedAction.payload.name === 'suggestedActionsOriginActivity') {
      ({ state } = parsedAction.payload);
    }
  }

  return state;
}

export default suggestedActionsOriginActivity;
