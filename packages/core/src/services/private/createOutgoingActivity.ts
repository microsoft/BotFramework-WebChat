import { setSendStatusInOutgoingActivity } from '@msinternal/botframework-webchat-core-activities';

import type { WebChatOutgoingActivity } from '../../types/internal/WebChatOutgoingActivity';
import type { WebChatActivity } from '../../types/WebChatActivity';
import dateToLocaleISOString from '../../utils/dateToLocaleISOString';
import deleteKey from '../../utils/deleteKey';

type CreateOutgoingActivityInit = {
  /** The activity to post, as given to `postActivity()`. */
  readonly activity: WebChatActivity;
  readonly clientActivityID: string;
  /** The first post of an online period carries the client capabilities. */
  readonly isFirstPost: boolean;
  readonly locale: string;
  // eslint-disable-next-line no-restricted-globals
  readonly now: Date;
  readonly userID: string;
  readonly username: string;
};

/**
 * The activity sent to the chat adapter for an activity to post: without its ID and local fields, from the user of the
 * session, with the client activity ID, locale, local timestamp and time zone; a message keeps only the attachment
 * fields of Bot Framework and the text, an event its name and value.
 *
 * Same as `postActivitySaga`.
 */
export default function createOutgoingActivity({
  activity,
  clientActivityID,
  isFirstPost,
  locale,
  now,
  userID,
  username
}: CreateOutgoingActivityInit): WebChatOutgoingActivity {
  const attachments = (activity.type === 'message' && activity.attachments) || [];
  const localTimeZone =
    typeof window.Intl === 'undefined' ? undefined : new Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Currently, we allow untyped outgoing activity as long as the chat adapter can deliver.
  // In the future, we should warn if the outgoing activity is not matching the type.
  let outgoingActivity: WebChatOutgoingActivity = {
    ...deleteKey(activity, 'id'),
    channelData: {
      // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
      // Please refer to #4362 for details. Remove on or after 2024-07-31.
      ...deleteKey(activity.channelData, 'state', 'webchat:internal:local-id', 'webchat:internal:position'),
      clientActivityID
    },
    channelId: 'webchat',
    from: {
      id: userID,
      name: username,
      role: 'user'
    },
    locale,
    localTimestamp: dateToLocaleISOString(now),
    localTimezone: localTimeZone,
    ...(activity.type === 'message'
      ? {
          attachments:
            attachments &&
            attachments.map(({ contentType, contentUrl, name, thumbnailUrl }) => ({
              contentType,
              contentUrl,
              name,
              thumbnailUrl
            })),
          text: activity.text
        }
      : activity.type === 'event'
        ? {
            name: activity.name,
            value: activity.value
          }
        : {})
  };

  // Remove local fields that should not be send to the service.
  outgoingActivity = setSendStatusInOutgoingActivity(
    // TODO: [P1] Need to rework WebChatActivity typing.
    outgoingActivity as WebChatActivity,
    undefined
  ) as WebChatOutgoingActivity;

  if (isFirstPost) {
    outgoingActivity.entities = [
      ...(outgoingActivity.entities || []),
      {
        // TODO: [P4] Currently in v3, we send the capabilities although the client might not actually have them
        //       We need to understand why we need to send these, and only send capabilities the client have
        requiresBotState: true,
        supportsListening: true,
        supportsTts: true,
        type: 'ClientCapabilities'
      }
    ];
  }

  return outgoingActivity;
}

export type { CreateOutgoingActivityInit };
