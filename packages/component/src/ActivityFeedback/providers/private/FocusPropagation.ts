import { type OrgSchemaAction } from 'botframework-webchat-core';
import { createPropagation } from 'use-propagate';

const {
  PropagationScope: ActivityFeedbackFocusPropagationScope,
  useListen: useListenToFocus,
  usePropagate: usePropagateFocus
} = createPropagation<OrgSchemaAction>();

export { ActivityFeedbackFocusPropagationScope, useListenToFocus, usePropagateFocus };
