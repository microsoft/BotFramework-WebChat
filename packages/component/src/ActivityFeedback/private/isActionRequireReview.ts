import { type OrgSchemaAction } from 'botframework-webchat-core/org-schema.js';
import { isOfType } from 'botframework-webchat-core/json-ld.js';

export default function isActionRequireReview(
  action: OrgSchemaAction | undefined
): action is OrgSchemaAction & { result: { '@type': 'UserReview'[] } } {
  const [firstResult] = action?.result ?? [];

  return isOfType('UserReview', firstResult);
}
