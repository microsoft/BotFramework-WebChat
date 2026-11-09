/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2, 3, 4] }] */

const CONNECTIVITY_STATUS_NOTIFICATION_ID = 'connectivitystatus';

type ConnectivityStatusNotification = {
  readonly id: typeof CONNECTIVITY_STATUS_NOTIFICATION_ID;
  readonly level: 'error' | 'info' | 'success';
  readonly message: 'connected' | 'connecting' | 'failedtoconnect' | 'reconnecting';
};

/**
 * The "connectivitystatus" notification for a Direct Line connection status, if any (none for 5, "expired token").
 * `reconnecting` is `true` after the connection was online or failed once (on the same subscription).
 *
 * Moved from `connectionStatusToNotificationSaga.js`; both the saga and the connection service use it.
 */
export default function getConnectivityStatusNotification(
  connectionStatus: unknown,
  reconnecting: boolean
): { readonly notification?: ConnectivityStatusNotification | undefined; readonly reconnecting: boolean } {
  switch (connectionStatus) {
    case 0:
    case 1:
      return {
        notification: {
          id: CONNECTIVITY_STATUS_NOTIFICATION_ID,
          level: 'info',
          message: reconnecting ? 'reconnecting' : 'connecting'
        },
        reconnecting
      };

    case 2:
      return {
        notification: { id: CONNECTIVITY_STATUS_NOTIFICATION_ID, level: 'success', message: 'connected' },
        reconnecting: true
      };

    case 3:
    case 4:
      return {
        notification: { id: CONNECTIVITY_STATUS_NOTIFICATION_ID, level: 'error', message: 'failedtoconnect' },
        reconnecting: true
      };

    default:
      return { reconnecting };
  }
}

export { CONNECTIVITY_STATUS_NOTIFICATION_ID, type ConnectivityStatusNotification };
