/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2, 3, 4] }] */

import { CONNECT } from '../../actions/connect';
import setNotification from '../../actions/setNotification';
import { is } from '../private/effects';
import type { Machine } from '../types';

const CONNECTIVITY_STATUS_NOTIFICATION_ID = 'connectivitystatus';

/**
 * The "connectivitystatus" notification of the Direct Line of the latest `CONNECT`. It follows that Direct Line after a
 * disconnect too, until the next `CONNECT`.
 */
const connectionStatusToNotificationMachine: Machine = scope =>
  scope.onLatest(is(CONNECT), ({ payload: { directLine } }, worker) => {
    let reconnecting = false;

    worker.observeEach(directLine.connectionStatus$, (value, next) => {
      // The notification has no `alt` or `data`: `setNotification()` sets them `undefined`.
      const putNotification = (level: string, message: string) =>
        worker.put(setNotification({ id: CONNECTIVITY_STATUS_NOTIFICATION_ID, level, message } as any), next);

      switch (value) {
        case 0:
        case 1:
          putNotification('info', reconnecting ? 'reconnecting' : 'connecting');
          break;

        case 2:
          reconnecting = true;
          putNotification('success', 'connected');
          break;

        case 3:
        case 4:
          reconnecting = true;
          putNotification('error', 'failedtoconnect');
          break;

        default:
          next();
          break;
      }
    });
  });

export default connectionStatusToNotificationMachine;
