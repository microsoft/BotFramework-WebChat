import { WebChatActivity } from 'botframework-webchat-core';
import React, { memo } from 'react';
import FeedbackLoopWithMessage from './private/FeedbackLoopWithMessage';
import FeedbackLoopWithoutMessage from './private/FeedbackLoopWithoutMessage';
import ActivityFeedbackComposer from './providers/ActivityFeedbackComposer';
import useShouldShowFeedbackForm from './providers/useShouldShowFeedbackForm';

const InternalActivityFeedback = memo(() =>
  useShouldShowFeedbackForm()[0] ? <FeedbackLoopWithMessage /> : <FeedbackLoopWithoutMessage />
);

InternalActivityFeedback.displayName = 'InternalActivityFeedback';

type ActivityFeedbackProps = Readonly<{
  activity: WebChatActivity;
}>;

function ActivityFeedback({ activity }: ActivityFeedbackProps) {
  return (
    <ActivityFeedbackComposer initialActivity={activity}>
      <InternalActivityFeedback />
    </ActivityFeedbackComposer>
  );
}

export default memo(ActivityFeedback);
export { type ActivityFeedbackProps };
