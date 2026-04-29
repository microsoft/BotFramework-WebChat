import { parse } from 'valibot';
import { creativeWorkSchema, type CreativeWorkOutput } from '../types/external/OrgSchema/CreativeWork';
import { type WebChatActivity } from '../types/WebChatActivity';

type EntityType = NonNullable<WebChatActivity['entities']>[number];

export default function getOrgSchemaMessage(graph: readonly EntityType[]): CreativeWorkOutput | undefined {
  for (const entity of graph ?? []) {
    const isPossiblySelfMessage =
      entity &&
      typeof entity === 'object' &&
      'type' in entity &&
      entity.type?.startsWith('https://schema.org/') &&
      '@id' in entity &&
      entity['@id'] === '';

    if (isPossiblySelfMessage) {
      return parse(creativeWorkSchema, entity);
    }
  }
}
