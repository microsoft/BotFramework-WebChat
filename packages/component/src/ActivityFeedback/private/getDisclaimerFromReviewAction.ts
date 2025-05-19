import { type OrgSchemaAction, type OrgSchemaThing, type OrgSchemaUserReview } from 'botframework-webchat-core';

function isUserReview(thing: OrgSchemaThing | undefined): thing is OrgSchemaUserReview {
  return thing?.['@type'] === 'UserReview';
}

export default function getDisclaimerFromActivity(action: OrgSchemaAction): string | undefined {
  return isUserReview(action.result) ? action.result.reviewAspect : undefined;
}
