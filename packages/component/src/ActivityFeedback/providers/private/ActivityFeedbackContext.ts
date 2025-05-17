import { type OrgSchemaAction, type WebChatActivity } from 'botframework-webchat-core';
import { createContext, type Dispatch, type SetStateAction } from 'react';

type ActivityFeedbackContextType = Readonly<{
  useActions: () => readonly [readonly OrgSchemaAction[]];
  useActivity: () => readonly [WebChatActivity];
  useFeedbackText: () => readonly [string, Dispatch<SetStateAction<string>>];
  useFocusFeedbackButton: () => (action: OrgSchemaAction) => void;
  useHasSubmitted: () => readonly [boolean];
  useSelectedActions: () => readonly [OrgSchemaAction, (action: OrgSchemaAction) => void];
  useShouldAllowResubmit: () => readonly [boolean];
  useShouldShowFeedbackForm: () => readonly [boolean];
  useSubmit: () => (action: OrgSchemaAction) => void;
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
