import type { WebChatActivity } from '../../types/WebChatActivity';

/**
 * Whether an incoming activity is from someone else than the user, as `speakActivityAndStartDictateOnIncomingActivityFromOthersSaga`.
 *
 * In Direct Line, the "role" is not filled (yet), but the user ID is known. In Direct Line Speech, the user ID is not
 * known, but the "role" is "bot" or "user". So: not from the user ID, and not with the role "user".
 */
function isFromOthers(activity: WebChatActivity, userID: string): boolean {
  return activity.from.id !== userID && activity.from.role !== 'user';
}

/**
 * Whether a message has something to speak: `speak`, `text`, or an attachment with `content.speak`.
 *
 * Quirk kept on purpose (to fix in both modes later): an attachment with `content: null`, on a message without `speak`
 * and `text`, throws.
 */
function hasSpeakableContent(activity: WebChatActivity): boolean {
  const { attachments, speak, text } = activity as WebChatActivity & {
    attachments?: readonly { content?: { speak?: string } }[];
    speak?: string;
    text?: string;
  };

  return !!(speak || text || ~(attachments || []).findIndex(({ content: { speak } = {} }) => speak));
}

export { hasSpeakableContent, isFromOthers };
