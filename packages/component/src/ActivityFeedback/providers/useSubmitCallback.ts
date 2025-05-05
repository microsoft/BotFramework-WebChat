import { type OrgSchemaAction } from 'botframework-webchat-core';
import useActivityFeedbackContext from './private/useActivityFeedbackContext';

export default function useSubmitCallback(): (target: OrgSchemaAction, message?: string | undefined) => void {
  return useActivityFeedbackContext().submitCallback;
}
