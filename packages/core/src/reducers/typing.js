/*eslint no-case-declarations: "off"*/
/*eslint no-unused-vars: "off"*/

import updateIn from 'simple-update-in';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { POST_ACTIVITY_PENDING } from '../actions/postActivity';

const DEFAULT_STATE = {};

export default function lastTyping(state = DEFAULT_STATE, { payload, type }) {
  if (type === INCOMING_ACTIVITY || type === POST_ACTIVITY_PENDING) {
    const {
      activity: {
        from: { id, name, role },
        type: activityType
      }
    } = payload;

    if (activityType === 'typing') {
      const now = Date.now();

      state = updateIn(state, [id, 'at'], at => at || now);
      state = updateIn(state, [id, 'last'], () => now);
      state = updateIn(state, [id, 'name'], () => name);
      state = updateIn(state, [id, 'role'], () => role);
    } else if (activityType === 'message') {
      state = updateIn(state, [id]);
    }
  }

  return state;
}
