import { hooks } from 'botframework-webchat-api';
import { getOrgSchemaMessage, OrgSchemaAction, parseAction, WebChatActivity } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { memo, useMemo } from 'react';
import { defaultFeedbackEntities } from './private/DefaultFeedbackEntities';
import { isDefaultFeedbackActivity } from './private/isDefaultFeedbackActivity';

import Feedback from './private/Feedback';
import dereferenceBlankNodes from '../Utils/JSONLinkedData/dereferenceBlankNodes';

const { useStyleOptions } = hooks;

type ActivityFeedbackProps = Readonly<{
  activity: WebChatActivity;
}>;

const parseActivity = (entities?: WebChatActivity['entities']) => {
  const graph = dereferenceBlankNodes(entities || []);
  const messageThing = getOrgSchemaMessage(graph);
  return { graph, messageThing };
};

const useGetMessageThing = (activity: WebChatActivity) =>
  useMemo(() => {
    const { messageThing, graph } = parseActivity(activity.entities);
    if (messageThing?.potentialAction) {
      return { includeDefaultFeedback: false, messageThing, graph };
    } else if (isDefaultFeedbackActivity(activity)) {
      return { includeDefaultFeedback: true, ...parseActivity([defaultFeedbackEntities]) };
    }
    return { includeDefaultFeedback: false, ...parseActivity() };
  }, [activity]);

function ActivityFeedback({ activity }: ActivityFeedbackProps) {
  const [{ feedbackActionsPlacement }] = useStyleOptions();

  const { messageThing, graph, includeDefaultFeedback } = useGetMessageThing(activity);

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

  return (
    <Feedback
      actions={feedbackActions}
      className={cx({
        'webchat__thumb-button--large': feedbackActionsPlacement === 'activity-actions'
      })}
      includeDefaultFeedback={includeDefaultFeedback}
    />
  );
}

export default memo(ActivityFeedback);
