import { hooks } from 'botframework-webchat-api';
import { getOrgSchemaMessage, OrgSchemaAction, parseAction, WebChatActivity } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { defaultFeedbackEntities } from './private/DefaultFeedbackEntities';
import { hasFeedbackLoop, getDisclaimer } from './private/feedbackActivity.util';

import Feedback from './private/Feedback';
import dereferenceBlankNodes from '../Utils/JSONLinkedData/dereferenceBlankNodes';
import FeedbackForm from './private/FeedbackForm';
import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';

const { useStyleOptions } = hooks;

type ActivityFeedbackProps = Readonly<{
  activity: WebChatActivity;
}>;

const ROOT_STYLE = {
  '&.webchat__feedback-form__root-container': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  '&.webchat__feedback-form__root-container__child': {
    display: 'flex'
  }
};

const parseActivity = (entities?: WebChatActivity['entities']) => {
  const graph = dereferenceBlankNodes(entities || []);
  const messageThing = getOrgSchemaMessage(graph);
  return { graph, messageThing };
};

const useGetMessageThing = (activity: WebChatActivity) =>
  useMemo(() => {
    const { messageThing, graph } = parseActivity(activity.entities);
    if (hasFeedbackLoop(activity)) {
      return { isFeedbackLoopSupported: true, ...parseActivity([defaultFeedbackEntities]) };
    }
    return { isFeedbackLoopSupported: false, messageThing, graph };
  }, [activity]);

function ActivityFeedback({ activity }: ActivityFeedbackProps) {
  const [{ feedbackActionsPlacement }] = useStyleOptions();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  const [selectedAction, setSelectedAction] = useState<OrgSchemaAction | undefined>();

  const { messageThing, graph, isFeedbackLoopSupported } = useGetMessageThing(activity);

  const feedbackActions = useMemo<ReadonlySet<OrgSchemaAction>>(() => {
    try {
      const reactActions = (messageThing?.potentialAction || []).filter(
        ({ '@type': type }) => type === 'LikeAction' || type === 'DislikeAction'
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
  }, [graph, messageThing?.potentialAction]);

  const handleFeedbackActionClick = useCallback(
    (action?: OrgSchemaAction) => {
      setSelectedAction(action === selectedAction ? undefined : action);
    },
    [selectedAction]
  );

  const FeedbackComponent = useMemo(
    () => (
      <Feedback
        actions={feedbackActions}
        className={classNames({
          'webchat__thumb-button--large': feedbackActionsPlacement === 'activity-actions'
        })}
        isFeedbackFormSupported={isFeedbackLoopSupported}
        onHandleFeedbackActionClick={handleFeedbackActionClick}
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
        onResetFeedbackForm={handleFeedbackActionClick}
        replyToId={activity.id}
      />
    ),
    [activity, handleFeedbackActionClick, selectedAction]
  );

  if (feedbackActionsPlacement === 'activity-actions' && isFeedbackLoopSupported) {
    return (
      <div className={classNames('webchat__feedback-form__root-container', rootClassName)}>
        <div className={classNames('webchat__feedback-form__root-container__child', rootClassName)}>
          {FeedbackComponent}
        </div>
        {selectedAction && selectedAction['@type'] && FeedbackFormComponent}
      </div>
    );
  }

  // If placement is not inline with activity, we don't show the feedback form.
  return FeedbackComponent;
}

export default memo(ActivityFeedback);
