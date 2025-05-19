import { type OrgSchemaAction } from 'botframework-webchat-core';

export default function getDisclaimerFromActivity(action: OrgSchemaAction): string | undefined {
  return action.result?.['@type'] === 'UserReview' ? action.result?.description : undefined;
}
