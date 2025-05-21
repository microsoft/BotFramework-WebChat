import { type OrgSchemaAction } from 'botframework-webchat-core';

export default function isActionRequireReview(
  action: OrgSchemaAction | undefined
): action is OrgSchemaAction & { result: { '@type': 'UserReview' } } {
  return action?.result?.['@type'] === 'UserReview';
}
