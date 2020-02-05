import updateIn from 'simple-update-in';

import { CLEAR_EXPIRED_NOTIFICATIONS } from '../actions/clearExpiredNotifications';
import { DISMISS_NOTIFICATION } from '../actions/dismissNotification';
import { SET_NOTIFICATION } from '../actions/setNotification';

const DEFAULT_STATE = {};

function filterMap(map, filter) {
  return Object.keys(map)
    .filter(key => filter.call(map, map[key], key))
    .reduce((nextMap, key) => {
      nextMap[key] = map[key];

      return nextMap;
    }, {});
}

export default function notifications(state = DEFAULT_STATE, { payload, type }) {
  const now = Date.now();

  if (type === CLEAR_EXPIRED_NOTIFICATIONS) {
    const nextState = filterMap(state, ({ expireAt }) => typeof expireAt !== 'number' || now < expireAt);

    // Only update the state object if there are changes
    if (Object.keys(nextState).length !== Object.keys(state).length) {
      state = nextState;
    }
  } else if (type === DISMISS_NOTIFICATION) {
    state = updateIn(state, [payload.id]);
  } else if (type === SET_NOTIFICATION) {
    const { alt, expireAt, id, level, message } = payload;

    state = updateIn(state, [id], () => ({
      alt,
      expireAt,
      id,
      level,
      message,
      timestamp: now
    }));
  }

  return state;
}
