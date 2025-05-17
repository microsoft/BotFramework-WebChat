import { type OrgSchemaAction } from 'botframework-webchat-core';
import { createPropagation } from 'use-propagate';

const {
  PropagationScope: FocusPropagationScope,
  useListen: useListenToFocus,
  usePropagate: usePropagateFocus
} = createPropagation<OrgSchemaAction>();

export { FocusPropagationScope, useListenToFocus, usePropagateFocus };
