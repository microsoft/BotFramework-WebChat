/*eslint no-case-declarations: "off"*/
/*eslint no-unused-vars: "off"*/

import updateIn from 'simple-update-in';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';

const DEFAULT_STATE = {};

export default function lastTypingAt(state = DEFAULT_STATE, { payload, type }) {
  if (type === INCOMING_ACTIVITY) {
    const {
      activity: {
        from: { id, role },
        type: activityType
      }
    } = payload;

    if (role !== 'user') {
      if (activityType === 'typing') {
        state = updateIn(state, [id], () => Date.now());
      } else if (activityType === 'message') {
        state = updateIn(state, [id]);
      }
    }
  }

  return state;
}
