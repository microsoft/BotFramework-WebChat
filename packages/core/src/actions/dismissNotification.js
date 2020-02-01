const DISMISS_NOTIFICATION = 'WEB_CHAT/DISMISS_NOTIFICATION';

function dismissNotification(id) {
  return {
    type: DISMISS_NOTIFICATION,
    payload: { id }
  };
}

export default dismissNotification;

export { DISMISS_NOTIFICATION };
