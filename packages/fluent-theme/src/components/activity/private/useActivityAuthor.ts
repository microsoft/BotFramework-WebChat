import { orgSchemaPersonSchema, type OrgSchemaPerson } from 'botframework-webchat-core';
import { getOrgSchemaMessage, type WebChatActivity } from 'botframework-webchat/internal';
import { useMemo } from 'react';
import { parse } from 'valibot';

export default function useActivityAuthor(activity?: WebChatActivity | undefined): OrgSchemaPerson | undefined {
  return useMemo(() => {
    const entity = getOrgSchemaMessage(activity?.entities || []);

    const [firstAuthor] = entity?.author ?? [];

    return typeof firstAuthor === 'string'
      ? parse(orgSchemaPersonSchema, {
          '@type': 'Person',
          description: undefined,
          image: undefined,
          name: firstAuthor
        })
      : firstAuthor;
  }, [activity]);
}
