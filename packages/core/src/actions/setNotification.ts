import uniqueID from '../utils/uniqueID';

import type { Notification } from '../types/internal/Notification';

const SET_NOTIFICATION = 'WEB_CHAT/SET_NOTIFICATION';

type SetNotificationAction = {
  payload: Omit<Notification, 'timestamp'>;
  type: typeof SET_NOTIFICATION;
};

export default function setNotification({
  alt,
  data,
  id,
  level,
  message
}: Omit<Notification, 'timestamp'>): SetNotificationAction {
  if (!id || typeof id !== 'string') {
    console.warn(
      'botframework-webchat: The "id" argument passed to "setNotification" must be a string; defaulting to a random value.'
    );

    id = uniqueID();
  }

  if (!level || typeof level !== 'string') {
    console.warn(
      'botframework-webchat: The "level" argument passed to "setNotification" must be a string; defaulting to "info".'
    );

    level = 'info';
  }

  return {
    type: SET_NOTIFICATION,
    payload: { alt, data, id, level, message }
  };
}

export { SET_NOTIFICATION };

export type { SetNotificationAction };
