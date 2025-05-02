import { hooks } from 'botframework-webchat-api';
import { getOrgSchemaMessage, OrgSchemaAction, parseAction, WebChatActivity } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, useCallback, useMemo, useState } from 'react';

import useStyleSet from '../hooks/useStyleSet';
import dereferenceBlankNodes from '../Utils/JSONLinkedData/dereferenceBlankNodes';
import Feedback from './private/Feedback';
import FeedbackForm from './private/FeedbackForm';
import getDisclaimer from './private/getDisclaimer';
import hasFeedbackLoop from './private/hasFeedbackLoop';
import { useRefFrom } from 'use-ref-from';

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

function ActivityFeedback({ activity }: ActivityFeedbackProps) {
  const [{ feedbackActionsPlacement }] = useStyleOptions();
  const [{ feedbackForm }] = useStyleSet();

  const [selectedAction, setSelectedAction] = useState<OrgSchemaAction | undefined>();
  const selectedActionRef = useRefFrom(selectedAction);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const feedbackSubmittedRef = useRefFrom(feedbackSubmitted);
  const submittedAction = feedbackSubmitted ? selectedAction : undefined;

  const isFeedbackLoopSupported = hasFeedbackLoop(activity);

  const { graph, messageThing } = useMemo(() => {
    if (isFeedbackLoopSupported) {
      return parseActivity([defaultFeedbackEntities]);
    }

    return parseActivity(activity.entities);
  }, [activity.entities, isFeedbackLoopSupported]);

  const feedbackActions = useMemo<ReadonlySet<OrgSchemaAction>>(() => {
    try {
      const reactActions = (messageThing?.potentialAction || [])
        .filter(({ '@type': type }) => type === 'LikeAction' || type === 'DislikeAction')
        .map(action => (submittedAction && action['@type'] === submittedAction['@type'] ? submittedAction : action));

      if (reactActions.length) {
        return Object.freeze(new Set(reactActions));
      }

      const voteActions = graph.filter(({ type }) => type === 'https://schema.org/VoteAction').map(parseAction);

      if (voteActions.length) {
        return Object.freeze(new Set(voteActions));
      }
    } catch {
      // Intentionally left blank.
    }
    return Object.freeze(new Set([] as OrgSchemaAction[]));
  }, [graph, messageThing, submittedAction]);

  const handleFeedbackActionClick = useCallback(
    (action: OrgSchemaAction) => setSelectedAction(action === selectedAction ? undefined : action),
    [selectedAction, setSelectedAction]
  );

  const handleFeedbackFormReset = useCallback(() => {
    if (feedbackSubmittedRef.current) {
      return;
    }

    setSelectedAction(undefined);
    setFeedbackSubmitted(false);
  }, [feedbackSubmittedRef]);

  const handleFeedbackFormSubmit = useCallback(() => {
    if (feedbackSubmittedRef.current || !selectedActionRef.current) {
      return;
    }

    setSelectedAction({
      ...selectedActionRef.current,
      actionStatus: 'CompletedActionStatus' as const
    });
    setFeedbackSubmitted(true);
  }, [feedbackSubmittedRef, selectedActionRef]);

  const FeedbackComponent = useMemo(
    () => (
      <Feedback
        actions={feedbackActions}
        className={classNames({
          'webchat__thumb-button--large': feedbackActionsPlacement === 'activity-actions',
          'webchat__thumb-button--submitted': feedbackSubmitted
        })}
        isFeedbackFormSupported={isFeedbackLoopSupported}
        onActionClick={handleFeedbackActionClick}
        selectedAction={selectedAction}
      />
    ),
    [
      feedbackActions,
      feedbackActionsPlacement,
      feedbackSubmitted,
      handleFeedbackActionClick,
      isFeedbackLoopSupported,
      selectedAction
    ]
  );

  const FeedbackFormComponent = useMemo(
    () => (
      <FeedbackForm
        disclaimer={getDisclaimer(activity)}
        feedbackType={selectedAction?.['@type']}
        onReset={handleFeedbackFormReset}
        onSubmit={handleFeedbackFormSubmit}
        replyToId={activity.id}
      />
    ),
    [activity, handleFeedbackFormReset, handleFeedbackFormSubmit, selectedAction]
  );

  if (feedbackActionsPlacement === 'activity-actions' && isFeedbackLoopSupported) {
    return (
      <div className={classNames('webchat__feedback-form__root-container', feedbackForm + '')}>
        <div className={classNames('webchat__feedback-form__root-container__child', feedbackForm + '')}>
          {FeedbackComponent}
        </div>
        {/* Hide feedback form if feedback has already been submitted */}
        {!feedbackSubmitted && selectedAction && selectedAction['@type'] && FeedbackFormComponent}
      </div>
    );
  }

  // If placement is not inline with activity, we don't show the feedback form.
  return FeedbackComponent;
}

export default memo(ActivityFeedback);
