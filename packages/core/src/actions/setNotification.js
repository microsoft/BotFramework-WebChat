const SET_NOTIFICATION = 'WEB_CHAT/SET_NOTIFICATION';

export default function setNotification({ alt, expireAt, id, level, message, permanent }) {
  return {
    type: SET_NOTIFICATION,
    payload: { alt, expireAt, id, level, message, permanent }
  };
}

export { SET_NOTIFICATION };
