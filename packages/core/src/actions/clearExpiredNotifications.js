const CLEAR_EXPIRED_NOTIFICATIONS = 'WEB_CHAT/CLEAR_EXPIRED_NOTIFICATIONS';

export default function clearExpiredNotifications() {
  return {
    type: CLEAR_EXPIRED_NOTIFICATIONS
  };
}

export { CLEAR_EXPIRED_NOTIFICATIONS };
