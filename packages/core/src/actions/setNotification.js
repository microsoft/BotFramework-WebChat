import uniqueID from '../utils/uniqueID';

const SET_NOTIFICATION = 'WEB_CHAT/SET_NOTIFICATION';

export default function setNotification({ alt, data, id, level, message }) {
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
