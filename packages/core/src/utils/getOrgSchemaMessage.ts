import { type WebChatActivity } from '../types/WebChatActivity';
import { parseCreativeWork, type CreativeWork } from '../types/external/OrgSchema2/CreativeWork';
import { parseThing } from '../types/external/OrgSchema2/Thing';

export default function getOrgSchemaMessage(
  graph: readonly WebChatActivity['entities'][0][]
): CreativeWork | undefined {
  const messageEntity = (graph || []).find(entity => {
    const isThing = entity.type?.startsWith('https://schema.org/');

    if (isThing) {
      const thing = parseThing(entity);

      return thing['@id'] === '';
    }
  });

  const message = messageEntity && parseCreativeWork(messageEntity);

  return message && parseCreativeWork(message);
}
