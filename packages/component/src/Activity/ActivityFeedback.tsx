import { hooks } from 'botframework-webchat-api';
import { getOrgSchemaMessage, OrgSchemaAction, parseAction, WebChatActivity } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import useStyleSet from '../hooks/useStyleSet';
import dereferenceBlankNodes from '../Utils/JSONLinkedData/dereferenceBlankNodes';
import Feedback from './private/Feedback';
import FeedbackForm from './private/FeedbackForm';
import getDisclaimer from './private/getDisclaimer';
import hasFeedbackLoop from './private/hasFeedbackLoop';

const { useStyleOptions } = hooks;

type ActivityFeedbackProps = Readonly<{
  activity: WebChatActivity;
}>;

const parseActivity = (entities?: WebChatActivity['entities']) => {
  const graph = dereferenceBlankNodes(entities || []);
  const messageThing = getOrgSchemaMessage(graph);

  return { graph, messageThing };
};

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

const useFeedbackActions = (activity: WebChatActivity, isFeedbackLoopSupported: boolean) => {
  const { graph, messageThing } = useMemo(() => {
    if (isFeedbackLoopSupported) {
      return parseActivity([defaultFeedbackEntities]);
    }

    return parseActivity(activity.entities);
  }, [activity.entities, isFeedbackLoopSupported]);

  const feedbackActions = useMemo<OrgSchemaAction[]>(() => {
    try {
      const reactActions = (messageThing?.potentialAction || []).filter(
        ({ '@type': type }) => type === 'LikeAction' || type === 'DislikeAction'
      );

      if (reactActions.length) {
        return reactActions;
      }

      const voteActions = graph.filter(({ type }) => type === 'https://schema.org/VoteAction').map(parseAction);

      if (voteActions.length) {
        return voteActions;
      }
    } catch {
      // Intentionally left blank.
    }
    return [] as OrgSchemaAction[];
  }, [graph, messageThing]);

  const [currentFeedbackActions, setCurrentFeedbackActions] = useState(feedbackActions);

  // Handle feedback actions update via incoming activity
  useEffect(() => {
    setCurrentFeedbackActions(feedbackActions);
  }, [feedbackActions]);

  return { currentFeedbackActions, setCurrentFeedbackActions };
};

function ActivityFeedback({ activity }: ActivityFeedbackProps) {
  const [{ feedbackActionsPlacement }] = useStyleOptions();
  const [{ feedbackForm }] = useStyleSet();

  const isFeedbackLoopSupported = hasFeedbackLoop(activity);

  const { currentFeedbackActions: feedbackActions, setCurrentFeedbackActions } = useFeedbackActions(
    activity,
    isFeedbackLoopSupported
  );

  const selectedAction = feedbackActions.find(
    action => action.actionStatus === 'CompletedActionStatus' || action.actionStatus === 'ActiveActionStatus'
  );

  const handleFeedbackActionClick = useCallback(
    (action: OrgSchemaAction) => {
      const newActions: OrgSchemaAction[] = feedbackActions.map(feedbackAction => {
        // reset all actions to potential action status (unclicked the active action)
        if (action.actionStatus === 'ActiveActionStatus') {
          return {
            ...feedbackAction,
            actionStatus: 'PotentialActionStatus'
          };
        }

        return {
          ...feedbackAction,
          actionStatus: feedbackAction === action ? 'ActiveActionStatus' : 'PotentialActionStatus'
        };
      });
      setCurrentFeedbackActions(newActions);
    },
    [feedbackActions, setCurrentFeedbackActions]
  );

  const handleFeedbackFormClick = useCallback(
    (isSubmitted = false) => {
      const newActions: OrgSchemaAction[] = feedbackActions.map(action => ({
        ...action,
        actionStatus:
          action.actionStatus === 'ActiveActionStatus' && isSubmitted
            ? 'CompletedActionStatus'
            : 'PotentialActionStatus'
      }));
      setCurrentFeedbackActions(newActions);
    },
    [feedbackActions, setCurrentFeedbackActions]
  );

  const FeedbackComponent = useMemo(
    () => (
      <Feedback
        actions={feedbackActions}
        className={classNames({
          'webchat__thumb-button--large': feedbackActionsPlacement === 'activity-actions',
          'webchat__thumb-button--submitted': selectedAction?.actionStatus === 'CompletedActionStatus'
        })}
        isFeedbackFormSupported={isFeedbackLoopSupported}
        onActionClick={handleFeedbackActionClick}
        selectedAction={selectedAction}
      />
    ),
    [feedbackActions, feedbackActionsPlacement, handleFeedbackActionClick, isFeedbackLoopSupported, selectedAction]
  );

  const FeedbackFormComponent = useMemo(
    () => (
      <FeedbackForm
        disclaimer={getDisclaimer(activity)}
        feedbackType={selectedAction?.['@type']}
        onFeedbackFormButtonClick={handleFeedbackFormClick}
        replyToId={activity.id}
      />
    ),
    [activity, handleFeedbackFormClick, selectedAction]
  );

  if (feedbackActionsPlacement === 'activity-actions' && isFeedbackLoopSupported) {
    return (
      <div className={classNames('webchat__feedback-form__root-container', feedbackForm + '')}>
        <div className={classNames('webchat__feedback-form__root-container__child', feedbackForm + '')}>
          {FeedbackComponent}
        </div>
        {/* Hide feedback form if feedback has already been submitted */}
        {selectedAction?.['@type'] && selectedAction?.actionStatus === 'ActiveActionStatus' && FeedbackFormComponent}
      </div>
    );
  }

  // If placement is not inline with activity, we don't show the feedback form.
  return FeedbackComponent;
}

export default memo(ActivityFeedback);
