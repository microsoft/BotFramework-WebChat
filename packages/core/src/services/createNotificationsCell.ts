import { isForbiddenPropertyName } from '@msinternal/botframework-webchat-base/utils';
import updateIn from 'simple-update-in';

import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { Notification } from '../types/internal/Notification';
import uniqueID from '../utils/uniqueID';
import createCell from './private/createCell';
import type { Notify, Source } from './types';

type Notifications = Readonly<Record<string, Notification>>;

/** As the argument of the `setNotification()` action creator. */
type NotificationInit = {
  readonly alt?: string | undefined;
  readonly data?: unknown;
  readonly id: string;
  readonly level: string;
  readonly message?: string | undefined;
};

type NotificationsCell = {
  /** Removes the notification with the ID, if any (`DISMISS_NOTIFICATION`). */
  readonly dismissNotification: (id: string) => void;
  /** Sets the message of the "connectivitystatus" notification to "javascripterror" (`SAGA_ERROR`). */
  readonly markJavaScriptError: () => void;
  /** The notifications by ID, as the `notifications` slice of the Redux store. */
  readonly notifications: Source<Notifications>;
  /** Adds or replaces a notification (`setNotification()` and `SET_NOTIFICATION`). */
  readonly setNotification: (notification: NotificationInit) => void;
};

const EMPTY: Notifications = Object.freeze({});

/**
 * The notifications, without Redux: the same rules as the `notifications` reducer of core and the `setNotification()`
 * action creator.
 *
 * - A notification is replaced (with a new timestamp from the ponyfill) only if its `alt`, `data`, `level` or `message`
 *   changed. Forbidden IDs (e.g. `__proto__`) are ignored.
 * - Without a string `id` or `level`, warns and uses a random ID or `"info"`.
 */
export default function createNotificationsCell({
  notify = callListeners => callListeners(),
  ponyfill
}: {
  readonly notify?: Notify | undefined;
  readonly ponyfill: Pick<GlobalScopePonyfill, 'Date'>;
}): NotificationsCell {
  const cell = createCell<Notifications>(EMPTY, notify);

  return Object.freeze({
    dismissNotification: (id: string) => cell.set(updateIn(cell.get(), [id])),
    markJavaScriptError: () =>
      cell.set(updateIn(cell.get(), ['connectivitystatus', 'message'], () => 'javascripterror')),
    notifications: Object.freeze({ get: cell.get, subscribe: cell.subscribe }),
    setNotification: ({ alt, data, id, level, message }: NotificationInit) => {
      // Same as the `setNotification()` action creator.
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

      // Same as the reducer.
      if (!isForbiddenPropertyName(id)) {
        const state = cell.get();
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
          cell.set(
            updateIn(state, [id], () => ({
              alt,
              data,
              id,
              level,
              message,
              timestamp: ponyfill.Date.now()
            }))
          );
        }
      }
    }
  });
}

export type { NotificationInit, Notifications, NotificationsCell };
