import { type OrgSchemaAction, type WebChatActivity } from 'botframework-webchat-core';
import { createContext, type Dispatch, type SetStateAction } from 'react';

type ActivityFeedbackContextType = Readonly<{
  actionsState: readonly [readonly OrgSchemaAction[]];
  feedbackTextState: readonly [string, Dispatch<SetStateAction<string>>];
  hasSubmittedState: readonly [boolean];
  activityState: readonly [WebChatActivity];
  selectedActionState: readonly [OrgSchemaAction, (action: OrgSchemaAction) => void];
  shouldAllowResubmitState: readonly [boolean];
  shouldShowFeedbackFormState: readonly [boolean];
  submitCallback: (action: OrgSchemaAction) => void;
}>;

const ActivityFeedbackContext = createContext<ActivityFeedbackContextType>(
  new Proxy({} as ActivityFeedbackContextType, {
    get() {
      throw new Error('botframework-webchat: This hook can only be used under <ActivityFeedbackContext>');
    }
  })
);

export default ActivityFeedbackContext;
export { type ActivityFeedbackContextType };
