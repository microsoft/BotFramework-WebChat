import { hooks } from 'botframework-webchat-api';
import { getVoiceActivityRole, type WebChatActivity } from 'botframework-webchat-core';
import { useCallback } from 'react';

const { useLocalizer, useStyleOptions } = hooks;

/**
 * Returns a function to get the screen reader text narrated before the content of an activity, e.g. "You said:" or
 * "Bot JD said:".
 *
 * Bot initials set in the per-activity `channelData.webChat.styleOptions.botAvatarInitials` take precedence over
 * `styleOptions.botAvatarInitials`, so each sender is narrated with their own initials, e.g. a bot and a live agent.
 */
export default function useLocalizeActivityGreetingAlt(): (activity: WebChatActivity) => readonly [string] {
  const [{ botAvatarInitials }] = useStyleOptions();
  const localize = useLocalizer();

  return useCallback(
    (activity: WebChatActivity) => {
      // Merged as in useActivityStyleOptions, so a per-activity `null` hides the initials here too.
      const { botAvatarInitials: initials } = { botAvatarInitials, ...activity.channelData?.webChat?.styleOptions };

      return Object.freeze([
        // Transcripts of what the user said in a voice conversation come from the bot.
        (activity.from?.role === 'user' || getVoiceActivityRole(activity) === 'user'
          ? localize('ACTIVITY_YOU_SAID_ALT')
          : localize('ACTIVITY_BOT_SAID_ALT', typeof initials === 'string' ? initials : '')
        ).replace(/\s{2,}/gu, ' ')
      ] as const);
    },
    [botAvatarInitials, localize]
  );
}
