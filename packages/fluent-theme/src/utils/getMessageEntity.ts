import { array, literal, object, optional, safeParse, string, type InferOutput } from 'valibot';

const messageEntity = object({
  '@context': literal('https://schema.org'),
  '@id': literal(''), // Must be empty string.
  '@type': literal('Message'),
  keywords: optional(array(string()), []),
  type: literal('https://schema.org/Message')
});

type MessageEntity = InferOutput<typeof messageEntity>;

// TODO: We should move this file to base package once it's ready.
export default function getMessageEntity(
  activity: Readonly<{
    entities?: readonly Readonly<{ type: string }>[] | undefined;
    type: string;
  }>
): MessageEntity | undefined {
  if (activity?.type === 'message') {
    return activity.entities?.find((entity): entity is MessageEntity => safeParse(messageEntity, entity).success);
  }

  return undefined;
}
