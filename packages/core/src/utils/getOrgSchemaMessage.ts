import { parse } from 'valibot';
import { creativeWorkSchema, type CreativeWorkOutput } from '../types/external/OrgSchema/CreativeWork';
import { thingSchema } from '../types/external/OrgSchema/Thing';
import { type WebChatActivity } from '../types/WebChatActivity';

type EntityType = NonNullable<WebChatActivity['entities']>[number];

export default function getOrgSchemaMessage(graph: readonly EntityType[]): CreativeWorkOutput | undefined {
  const messageEntity = (graph || []).find(entity => {
    const isThing = entity.type?.startsWith('https://schema.org/');

    if (isThing) {
      const thing = parse(thingSchema, entity);

      return thing['@id'] === '';
    }
  });

  const message = messageEntity && parse(creativeWorkSchema, messageEntity);

  return message && parse(creativeWorkSchema, message);
}
