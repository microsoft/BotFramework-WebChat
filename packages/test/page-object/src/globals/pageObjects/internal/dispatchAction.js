import { dispatch } from '../../testHelpers/createStore';
import getStoreMode, { getTestHandle, ReduxOnlyTest } from '../../testHelpers/storeMode';

// The actions of card action middleware's `dispatch()`: the default providers send them without a Redux store.
const SEND_TYPES = Object.freeze([
  'DIRECT_LINE/POST_ACTIVITY',
  'WEB_CHAT/SEND_EVENT',
  'WEB_CHAT/SEND_FILES',
  'WEB_CHAT/SEND_MESSAGE',
  'WEB_CHAT/SEND_MESSAGE_BACK',
  'WEB_CHAT/SEND_POST_BACK'
]);

/**
 * Dispatches the action to the Redux store of the test (`testHelpers.createStore()`). In default mode, does the same
 * through the test handle of the default providers that connected last, for the actions they can take: those that send
 * activities, `INCOMING_ACTIVITY` (into the activities, as the reducer does), `SET_NOTIFICATION` and
 * `DISMISS_NOTIFICATION`. Other actions need a Redux store.
 */
export default function dispatchAction(action) {
  if (getStoreMode() !== 'default') {
    return dispatch(action);
  }

  const testHandle = getTestHandle();

  if (!testHandle) {
    throw new ReduxOnlyTest(`dispatch() of "${action.type}" needs Web Chat connected on the default providers.`);
  } else if (SEND_TYPES.includes(action.type)) {
    return testHandle.dispatch(action);
  }

  switch (action.type) {
    case 'DIRECT_LINE/INCOMING_ACTIVITY':
      testHandle.receiveActivity(action.payload.activity);
      break;

    case 'WEB_CHAT/DISMISS_NOTIFICATION':
      testHandle.dismissNotification(action.payload.id);
      break;

    case 'WEB_CHAT/SET_NOTIFICATION':
      testHandle.setNotification(action.payload);
      break;

    default:
      throw new ReduxOnlyTest(`dispatch() of "${action.type}" needs a Redux store.`);
  }

  return action;
}
