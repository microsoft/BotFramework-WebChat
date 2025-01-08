import { useMemo } from 'react';
import { getOrgSchemaMessage, type WebChatActivity } from 'botframework-webchat-core';

export default function useActivityAuthor(activity?: WebChatActivity | undefined) {
  return useMemo(() => {
    const entity = getOrgSchemaMessage(activity?.entities || []);
    return typeof entity?.author === 'string'
      ? {
          '@type': 'Person',
          description: undefined,
          image: undefined,
          name: entity?.author
        }
      : entity?.author;
  }, [activity]);
}
