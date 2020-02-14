import updateIn from 'simple-update-in';

import { DISMISS_NOTIFICATION } from '../actions/dismissNotification';
import { SAGA_ERROR } from '../actions/sagaError';
import { SET_NOTIFICATION } from '../actions/setNotification';

const DEFAULT_STATE = {};

export default function notifications(state = DEFAULT_STATE, { payload, type }) {
  const now = Date.now();

  if (type === DISMISS_NOTIFICATION) {
    state = updateIn(state, [payload.id]);
  } else if (type === SAGA_ERROR) {
    state = updateIn(state, ['connectivitystatus', 'message'], () => 'javascripterror');
  } else if (type === SET_NOTIFICATION) {
    const { alt, data, id, level, message } = payload;
    const notification = state[id];

    if (
      !notification ||
      alt !== notification.alt ||
      !Object.is(data, notification.data) ||
      level !== notification.level ||
      message !== notification.message
    ) {
      state = updateIn(state, [id], () => ({
        alt,
        data,
        id,
        level,
        message,
        timestamp: now
      }));
    }
  }

  return state;
}
