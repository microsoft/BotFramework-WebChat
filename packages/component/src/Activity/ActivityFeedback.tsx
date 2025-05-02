import { hooks } from 'botframework-webchat-api';
import { WebChatActivity } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { memo } from 'react';
import useFeedbackActions from '../hooks/internal/useFeedbackActions';
import Feedback from './private/Feedback';

const { useStyleOptions } = hooks;

type ActivityFeedbackProps = Readonly<{
  activity: WebChatActivity;
}>;

function ActivityFeedback({ activity }: ActivityFeedbackProps) {
  const [{ feedbackActionsPlacement }] = useStyleOptions();

  const { currentFeedbackActions: feedbackActions, updateFeedbackActions } = useFeedbackActions(activity);

  return (
    <Feedback
      actions={feedbackActions}
      className={cx({
        'webchat__thumb-button--large': feedbackActionsPlacement === 'activity-actions'
      })}
      onActionClick={updateFeedbackActions}
    />
  );
}

export default memo(ActivityFeedback);
