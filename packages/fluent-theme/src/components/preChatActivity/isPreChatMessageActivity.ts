import type { WebChatActivity } from 'botframework-webchat-core';
import { array, literal, object, safeParse, string, type InferOutput } from 'valibot';

const messageEntity = object({
  '@context': literal('https://schema.org'),
  '@id': literal(''), // Must be empty string.
  '@type': literal('Message'),
  keywords: array(string()),
  type: literal('https://schema.org/Message')
});

type MessageEntity = InferOutput<typeof messageEntity>;

export default function isPreChatMessageActivity(
  activity: undefined | WebChatActivity
): activity is WebChatActivity & { type: 'message' } {
  if (activity?.type !== 'message') {
    return false;
  }

  const message = activity.entities?.find(
    (entity): entity is MessageEntity => safeParse(messageEntity, entity).success
  );

  return !!message?.keywords.includes('PreChatMessage');
}
