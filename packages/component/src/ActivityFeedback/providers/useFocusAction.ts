import { type OrgSchemaAction } from 'botframework-webchat-core';
import { usePropagateFocus } from './private/FocusPropagation';

export default function useFocusAction(): (action: OrgSchemaAction) => void {
  return usePropagateFocus();
}
