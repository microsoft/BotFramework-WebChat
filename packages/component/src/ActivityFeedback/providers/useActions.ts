import { type OrgSchemaAction } from 'botframework-webchat-core';
import useActivityFeedbackContext from './private/useActivityFeedbackContext';

export default function useActions(): readonly [readonly OrgSchemaAction[]] {
  return useActivityFeedbackContext().actionsState;
}
