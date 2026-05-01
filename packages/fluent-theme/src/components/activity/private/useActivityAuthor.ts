import { getOrgSchemaMessage, type WebChatActivity } from 'botframework-webchat/internal.js';
import { orgSchemaPersonSchema, type OrgSchemaPerson } from 'botframework-webchat/schema.js';
import { useMemo } from 'react';
import { parse } from 'valibot';

/**
 * Returns the first `Message.author` if it is of type `Person` or `string`.
 *
 * String-based author will be convertewd to `Person` thing.
 */
export default function useActivityAuthor(activity?: WebChatActivity | undefined): OrgSchemaPerson | undefined {
  return useMemo(() => {
    const firstAuthor = getOrgSchemaMessage(activity?.entities || [])?.author[0];

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
