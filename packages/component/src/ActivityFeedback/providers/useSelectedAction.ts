import { type OrgSchemaAction } from 'botframework-webchat-core';
import useActivityFeedbackContext from './private/useActivityFeedbackContext';

export default function useSelectedAction(): readonly [OrgSchemaAction, (target: OrgSchemaAction) => void] {
  return useActivityFeedbackContext().selectedActionState;
}
