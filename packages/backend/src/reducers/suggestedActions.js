import updateIn from 'simple-update-in';

import { UPSERT_ACTIVITY } from '../Actions/upsertActivity';

const DEFAULT_STATE = [];

export default function (
  state = DEFAULT_STATE,
  {
    payload: { activity } = {},
    type
  }
) {
  switch (type) {
    case UPSERT_ACTIVITY:
      // TODO: UPSERT_ACTIVITY may not upsert-ing the most recent activity
      state = [...(activity && activity.suggestedActions && activity.suggestedActions.actions || [])];
      break;

    default: break;
  }

  return state;
}
