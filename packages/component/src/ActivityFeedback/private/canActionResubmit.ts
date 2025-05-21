import { type OrgSchemaAction } from 'botframework-webchat-core';
import isActionRequireReview from './isActionRequireReview';

export default function canActionResubmit(action: OrgSchemaAction | undefined): boolean {
  return !isActionRequireReview(action);
}
