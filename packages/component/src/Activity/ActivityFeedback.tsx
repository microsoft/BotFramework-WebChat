import { hooks } from 'botframework-webchat-api';
import { getOrgSchemaMessage, OrgSchemaAction, parseAction, WebChatActivity } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, useCallback, useMemo, useState } from 'react';
import useStyleSet from '../hooks/useStyleSet';
import dereferenceBlankNodes from '../Utils/JSONLinkedData/dereferenceBlankNodes';
import Feedback from './private/Feedback';
import getDisclaimer from './private/getDisclaimer';
import hasFeedbackLoop from './private/hasFeedbackLoop';
import FeedbackForm from './private/FeedbackForm';

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
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

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
        .map(action =>
          Object.assign({}, action, {
            actionStatus:
              action['@type'] === selectedAction?.['@type'] && feedbackSubmitted
                ? 'CompletedActionStatus'
                : action.actionStatus
          })
        );

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
    // Do not want to add selectedAction to the dependency array as it will cause an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackSubmitted, graph, messageThing?.potentialAction]);

  const handleFeedbackActionClick = useCallback(
    (action: OrgSchemaAction) => setSelectedAction(action === selectedAction ? undefined : action),
    [selectedAction, setSelectedAction]
  );

  const handleFeedbackFormReset = useCallback(
    (wasFeedbackSubmitted: boolean) => {
      if (!wasFeedbackSubmitted) {
        setSelectedAction(undefined);
      }
      setFeedbackSubmitted(wasFeedbackSubmitted);
    },
    [setFeedbackSubmitted, setSelectedAction]
  );

  const FeedbackComponent = useMemo(
    () => (
      <Feedback
        actions={feedbackActions}
        className={classNames({
          'webchat__thumb-button--large': feedbackActionsPlacement === 'activity-actions'
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
        onReset={handleFeedbackFormReset}
        replyToId={activity.id}
      />
    ),
    [activity, handleFeedbackFormReset, selectedAction]
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
