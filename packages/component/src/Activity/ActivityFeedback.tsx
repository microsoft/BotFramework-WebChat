import { hooks } from 'botframework-webchat-api';
import { getOrgSchemaMessage, OrgSchemaAction, parseAction, WebChatActivity } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { memo, useMemo } from 'react';

import Feedback from './private/Feedback';
import dereferenceBlankNodes from '../Utils/JSONLinkedData/dereferenceBlankNodes';

const { useStyleOptions } = hooks;

type ActivityFeedbackProps = Readonly<{
  activity: WebChatActivity;
  placement: 'activity-status' | 'activity-actions';
}>;

function ActivityFeedback({ activity, placement }: ActivityFeedbackProps) {
  const [{ feedbackActionsPlacement }] = useStyleOptions();

  const graph = useMemo(() => dereferenceBlankNodes(activity.entities || []), [activity.entities]);

  const messageThing = useMemo(() => getOrgSchemaMessage(graph), [graph]);

  const feedbackActions = useMemo<ReadonlySet<OrgSchemaAction> | undefined>(() => {
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
  }, [graph, messageThing?.potentialAction]);

  return feedbackActions?.size && placement === feedbackActionsPlacement ? (
    <Feedback
      actions={feedbackActions}
      className={cx({
        'webchat__thumb-button--large': feedbackActionsPlacement === 'activity-actions'
      })}
    />
  ) : null;
}

export default memo(ActivityFeedback);
