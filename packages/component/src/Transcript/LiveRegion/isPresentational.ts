import type { WebChatActivity } from 'botframework-webchat-core';

/**
 * Determines if the rendering activity is presentational or not.
 * Returns `true` if the activity is presentational and should not be read by screen reader, otherwise, `false`.
 *
 * @returns {boolean} `true` if the activity is presentational and should not be read by screen reader, otherwise, `false`.
 */
export default function isPresentational(activity: WebChatActivity): boolean {
  if (activity.type !== 'message') {
    return true;
  }

  const { channelData } = activity;

  // "Fallback text" includes both message text and narratives for attachments.
  // Emptying out "fallback text" essentially mute for both message and attachments.
  const fallbackText = channelData?.['webchat:fallback-text'];

  if (typeof fallbackText === 'string') {
    return !fallbackText;
  }

  // If there are "displayText" (MessageBack), "text", any attachments, or suggested actions, there are something to narrate.
  return !(
    channelData?.messageBack?.displayText ||
    activity.text ||
    activity.attachments?.length ||
    activity.suggestedActions?.actions?.length
  );
}
