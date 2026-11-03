import { type OrgSchemaAction } from 'botframework-webchat-core/org-schema.js';
import isActionRequireReview from './isActionRequireReview';

export default function canActionResubmit(action: OrgSchemaAction | undefined): boolean {
  return !isActionRequireReview(action);
}
