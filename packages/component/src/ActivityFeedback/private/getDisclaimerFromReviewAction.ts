import { orgSchemaUserReviewSchema, type OrgSchemaAction, type OrgSchemaThing } from 'botframework-webchat-core';
import { safeParse } from 'valibot';

export default function getDisclaimerFromActivity(action: OrgSchemaAction): string | undefined {
  const parseResult = safeParse(orgSchemaUserReviewSchema, action.result[0] satisfies OrgSchemaThing);

  return parseResult.success ? parseResult.output.reviewAspect[0] : undefined;
}
