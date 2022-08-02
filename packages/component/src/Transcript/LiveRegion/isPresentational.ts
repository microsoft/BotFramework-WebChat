import type { WebChatActivity } from 'botframework-webchat-core';

/**
 * Checks if the rendering activity is presentational or not. Returns `true` if presentational and should not be narrated, otherwise, `false`.
 *
 * Presentational activity, will be rendered visually but not going through screen reader.
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
