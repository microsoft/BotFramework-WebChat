import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import { useMemo } from 'react';

import useActivityStyleOptions from './useActivityStyleOptions.js';

const { useLocalizer } = hooks;

/**
 * Returns the screen reader text narrated before the content of an activity, e.g. "You said:" or "Bot JD said:".
 *
 * Bot initials set in the per-activity `channelData.webChat.styleOptions.botAvatarInitials` take precedence over
 * `styleOptions.botAvatarInitials`, so each sender is narrated with their own initials, e.g. a bot and a live agent.
 */
export default function useActivityGreetingAlt(activity: WebChatActivity, fromUser: boolean): readonly [string] {
  const [{ botAvatarInitials }] = useActivityStyleOptions(activity);
  const localize = useLocalizer();

  return useMemo(
    () =>
      Object.freeze([
        (fromUser
          ? localize('ACTIVITY_YOU_SAID_ALT')
          : localize('ACTIVITY_BOT_SAID_ALT', typeof botAvatarInitials === 'string' ? botAvatarInitials : '')
        ).replace(/\s{2,}/gu, ' ')
      ] as const),
    [botAvatarInitials, fromUser, localize]
  );
}
