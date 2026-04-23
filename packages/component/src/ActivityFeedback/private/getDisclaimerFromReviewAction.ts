import { orgSchemaUserReviewSchema, type OrgSchemaAction } from 'botframework-webchat-core';
import { safeParse } from 'valibot';

export default function getDisclaimerFromActivity(action: OrgSchemaAction): string | undefined {
  const userReview = safeParse(orgSchemaUserReviewSchema, action.result);

  return userReview.success ? userReview.output.reviewAspect[0] : undefined;
}
