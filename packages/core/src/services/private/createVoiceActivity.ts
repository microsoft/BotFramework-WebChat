import type { WebChatActivity } from '../../types/WebChatActivity';
import dateToLocaleISOString from '../../utils/dateToLocaleISOString';

type CreateVoiceActivityInit = {
  /** The voice activity to post, as given to `postVoiceActivity()`. */
  readonly activity: WebChatActivity;
  readonly locale: string;
  // eslint-disable-next-line no-restricted-globals
  readonly now: Date;
  readonly userID: string;
  readonly username: string | undefined;
};

/**
 * The voice activity sent to the chat adapter: the activity as given, from the user of the session, with the channel,
 * locale, local timestamp and time zone; an event keeps its name and value (the key `value` too, if undefined).
 *
 * Unlike other activities: no client activity ID, no client capabilities, nothing removed.
 *
 * Same as `postVoiceActivitySaga`.
 */
export default function createVoiceActivity({
  activity,
  locale,
  now,
  userID,
  username
}: CreateVoiceActivityInit): WebChatActivity {
  const localTimeZone =
    typeof window.Intl === 'undefined' ? undefined : new Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    ...activity,
    channelId: 'webchat',
    from: {
      id: userID,
      name: username,
      role: 'user'
    },
    locale,
    localTimestamp: dateToLocaleISOString(now),
    localTimezone: localTimeZone,
    ...(activity.type === 'event'
      ? {
          name: activity.name,
          value: activity.value
        }
      : {})
  } as WebChatActivity;
}

export type { CreateVoiceActivityInit };
