import { WebChatActivity } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, useCallback, useMemo } from 'react';
import useStyleSet from '../../hooks/useStyleSet';
import Feedback from './Feedback';
import FeedbackForm from './FeedbackForm';
import getDisclaimer from './getDisclaimer';
import useFeedbackActions from '../../hooks/internal/useFeedbackActions';

type ActivityFeedbackProps = Readonly<{
  activity: WebChatActivity;
}>;

const defaultFeedbackEntities = {
  '@context': 'https://schema.org',
  '@id': '',
  '@type': 'Message',
  type: 'https://schema.org/Message',
  keywords: [],
  potentialAction: [
    {
      '@type': 'LikeAction',
      actionStatus: 'PotentialActionStatus'
    },
    {
      '@type': 'DislikeAction',
      actionStatus: 'PotentialActionStatus'
    }
  ]
};

function ActivityFeedbackLoop({ activity }: ActivityFeedbackProps) {
  const activityFeedbackWithloop = useMemo(
    () =>
      Object.assign({}, activity, {
        entities: [defaultFeedbackEntities]
      }),
    [activity]
  );

  const [{ feedbackForm }] = useStyleSet();

  const {
    completeSelectedAction,
    currentFeedbackActions: feedbackActions,
    updateFeedbackActions,
    selectedAction
  } = useFeedbackActions(activityFeedbackWithloop);

  const handleFeedbackFormClick = useCallback(
    (isSubmitted = false) => (isSubmitted ? completeSelectedAction() : updateFeedbackActions()),
    [completeSelectedAction, updateFeedbackActions]
  );

  return (
    <div className={classNames('webchat__feedback-form__root-container', feedbackForm + '')}>
      <div className={classNames('webchat__feedback-form__root-container__child', feedbackForm + '')}>
        <Feedback
          actions={feedbackActions}
          className={classNames('webchat__thumb-button--large', {
            'webchat__thumb-button--submitted': selectedAction?.actionStatus === 'CompletedActionStatus'
          })}
          isFeedbackFormSupported={true}
          onActionClick={updateFeedbackActions}
          selectedAction={selectedAction}
        />
      </div>
      {/* Hide feedback form if feedback has already been submitted */}
      {selectedAction?.['@type'] && selectedAction?.actionStatus === 'ActiveActionStatus' && (
        <FeedbackForm
          disclaimer={getDisclaimer(activityFeedbackWithloop)}
          feedbackType={selectedAction?.['@type']}
          onFeedbackFormButtonClick={handleFeedbackFormClick}
          replyToId={activityFeedbackWithloop.id}
        />
      )}
    </div>
  );
}
export default memo(ActivityFeedbackLoop);
