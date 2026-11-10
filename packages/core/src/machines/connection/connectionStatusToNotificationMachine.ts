import { CONNECT } from '../../actions/connect';
import setNotification from '../../actions/setNotification';
import getConnectivityStatusNotification from '../../services/private/getConnectivityStatusNotification';
import { is } from '../private/effects';
import type { Machine } from '../types';

/**
 * `connectionStatusToNotificationSaga`: the "connectivitystatus" notification of the Direct Line of the latest
 * `CONNECT`. Quirk kept: it follows that Direct Line after a disconnect too, until the next `CONNECT`.
 */
const connectionStatusToNotificationMachine: Machine = scope =>
  scope.onLatest(is(CONNECT), ({ payload: { directLine } }, worker) => {
    let reconnecting = false;

    worker.observeEach(directLine.connectionStatus$, (value, next) => {
      const { notification, reconnecting: nextReconnecting } = getConnectivityStatusNotification(value, reconnecting);

      reconnecting = nextReconnecting;

      // The notification has no `alt` or `data`, as in the saga (JavaScript): `setNotification()` sets them `undefined`.
      notification ? worker.put(setNotification(notification as any), next) : next();
    });
  });

export default connectionStatusToNotificationMachine;
