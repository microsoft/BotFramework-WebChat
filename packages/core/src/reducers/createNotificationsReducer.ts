import updateIn from 'simple-update-in';

import { DISMISS_NOTIFICATION } from '../actions/dismissNotification';
import { SAGA_ERROR } from '../actions/sagaError';
import { SET_NOTIFICATION } from '../actions/setNotification';
import isForbiddenPropertyName from '../utils/isForbiddenPropertyName';

import type { DismissNotificationAction } from '../actions/dismissNotification';
import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { Notification } from '../types/internal/Notification';
import type { Reducer } from 'redux';
import type { SagaErrorAction } from '../actions/sagaError';
import type { SetNotificationAction } from '../actions/setNotification';

type NotificationsAction = DismissNotificationAction | SagaErrorAction | SetNotificationAction;
type NotificationsState = Record<string, Notification>;

const DEFAULT_STATE: NotificationsState = {};

export default function createNotificationsReducer({
  Date
}: GlobalScopePonyfill): Reducer<NotificationsState, NotificationsAction> {
  return function notifications(
    state: NotificationsState = DEFAULT_STATE,
    action: NotificationsAction
  ): NotificationsState {
    const { type } = action;
    const now = Date.now();

    if (type === DISMISS_NOTIFICATION) {
      state = updateIn(state, [action.payload.id]);
    } else if (type === SAGA_ERROR) {
      state = updateIn(state, ['connectivitystatus', 'message'], () => 'javascripterror');
    } else if (type === SET_NOTIFICATION) {
      const { alt, data, id, level, message } = action.payload;

      if (!isForbiddenPropertyName(id)) {
        // Mitigated through denylisting.
        // eslint-disable-next-line security/detect-object-injection
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
    }

    return state;
  };
}
