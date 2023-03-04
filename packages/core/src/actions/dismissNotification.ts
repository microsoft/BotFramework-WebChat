const DISMISS_NOTIFICATION = 'WEB_CHAT/DISMISS_NOTIFICATION';

type DismissNotificationAction = {
  payload: { id: string };
  type: typeof DISMISS_NOTIFICATION;
};

function dismissNotification(id: string): DismissNotificationAction {
  return {
    payload: { id },
    type: DISMISS_NOTIFICATION
  };
}

export default dismissNotification;

export { DISMISS_NOTIFICATION };

export type { DismissNotificationAction };
