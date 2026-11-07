import { parse } from 'valibot';
import { orgSchemaCreativeWorkSchema, type OrgSchemaCreativeWork } from '@msinternal/botframework-webchat-core-json-ld';
import type { WebChatActivity } from '../types/WebChatActivity';

type EntityType = NonNullable<WebChatActivity['entities']>[number];

export default function getOrgSchemaMessage(graph: readonly EntityType[]): OrgSchemaCreativeWork | undefined {
  for (const entity of graph ?? []) {
    const isPossiblySelfMessage =
      entity &&
      typeof entity === 'object' &&
      'type' in entity &&
      entity.type?.startsWith('https://schema.org/') &&
      '@id' in entity &&
      entity['@id'] === '';

    if (isPossiblySelfMessage) {
      return parse(orgSchemaCreativeWorkSchema, entity);
    }
  }
}
