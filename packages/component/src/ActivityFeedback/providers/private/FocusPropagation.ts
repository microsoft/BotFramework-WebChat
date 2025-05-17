import { type OrgSchemaAction } from 'botframework-webchat-core';
import { createPropagation } from 'use-propagate';

const {
  PropagationScope: ActivityFeedbackFocusPropagationScope,
  useListen: useListenToActivityFeedbackFocus,
  usePropagate: usePropagateActivityFeedbackFocus
} = createPropagation<OrgSchemaAction>();

export { ActivityFeedbackFocusPropagationScope, useListenToActivityFeedbackFocus, usePropagateActivityFeedbackFocus };
