import { IdentifierSchema } from '@msinternal/botframework-webchat-core-graph';
import { array, literal, number, object, safeParse, string, union } from 'valibot';
import type { WebChatActivity } from '../../../../types/WebChatActivity';
import getOrgSchemaMessage from '../../../../utils/getOrgSchemaMessage';

// TODO: [P0] Need to fix `getOrgSchemaMessage` before we can move to `NodeReferenceSchema`.
//       It is introducing new properties, should be relaxed.
const IsPartOfNodeReferenceSchema = object({ '@id': IdentifierSchema, '@type': string() });

const MessageIsPartOfSchema = object({
  '@type': literal('Message'),
  isPartOf: union([IsPartOfNodeReferenceSchema, array(IsPartOfNodeReferenceSchema)]),
  position: number()
});

export default function getPartGroupingMetadataMap(activity: WebChatActivity): ReadonlyMap<
  string,
  {
    readonly groupingId: string;
    readonly position: number;
  }
> {
  const metadataMap = new Map();

  const message = getOrgSchemaMessage(activity.entities || []);

  if (message) {
    const messageIsPartOfResult = safeParse(MessageIsPartOfSchema, message);

    if (messageIsPartOfResult.success) {
      const { isPartOf, position } = messageIsPartOfResult.output;

      // TODO: [P0] Simplify this code when we use the new graph, where all property values are array.
      for (const item of Array.isArray(isPartOf) ? isPartOf : [isPartOf]) {
        metadataMap.set(
          item['@type'],
          Object.freeze({
            groupingId: item['@id'],
            position
          })
        );
      }
    }
  }

  return metadataMap;
}
