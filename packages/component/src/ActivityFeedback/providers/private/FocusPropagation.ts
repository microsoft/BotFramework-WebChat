import { type OrgSchemaAction } from 'botframework-webchat-core/org-schema.js';
import { createPropagation } from 'use-propagate';

const {
  PropagationScope: ActivityFeedbackFocusPropagationScope,
  useListen: useListenToActivityFeedbackFocus,
  usePropagate: usePropagateActivityFeedbackFocus
} = createPropagation<OrgSchemaAction>();

export { ActivityFeedbackFocusPropagationScope, useListenToActivityFeedbackFocus, usePropagateActivityFeedbackFocus };
