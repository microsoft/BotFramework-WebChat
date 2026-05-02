import type { WebChatActivity } from '../../../../types/WebChatActivity';
import getOrgSchemaMessage from '../../../../utils/getOrgSchemaMessage';

type PartGroupingMetadataMapEntry = {
  readonly groupingId: string;
  readonly position: number | undefined;
};

function getPartGroupingMetadataMap(activity: WebChatActivity): ReadonlyMap<string, PartGroupingMetadataMapEntry> {
  const metadataMap = new Map<string, PartGroupingMetadataMapEntry>();

  const message = getOrgSchemaMessage(activity.entities || []);

  if (message) {
    for (const item of message.isPartOf) {
      if (item['@id']) {
        const [firstPosition] = message.position;

        for (const type of item['@type']) {
          metadataMap.set(
            type,
            Object.freeze({
              groupingId: item['@id'],
              position: typeof firstPosition === 'number' ? firstPosition : undefined
            })
          );
        }
      }
    }
  }

  return metadataMap;
}

export default getPartGroupingMetadataMap;
export type { PartGroupingMetadataMapEntry };
