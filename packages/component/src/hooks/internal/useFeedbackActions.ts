import { useCallback, useEffect, useMemo, useState } from 'react';
import { getOrgSchemaMessage, OrgSchemaAction, parseAction, WebChatActivity } from 'botframework-webchat-core';
import dereferenceBlankNodes from '../../Utils/JSONLinkedData/dereferenceBlankNodes';

const parseActivity = (entities?: WebChatActivity['entities']) => {
  const graph = dereferenceBlankNodes(entities || []);
  const messageThing = getOrgSchemaMessage(graph);

  return { graph, messageThing };
};

export default function useFeedbackActions(activity: WebChatActivity) {
  const { graph, messageThing } = useMemo(() => parseActivity(activity.entities), [activity.entities]);

  const feedbackActions = useMemo<readonly OrgSchemaAction[]>(() => {
    try {
      const reactActions = Object.freeze((messageThing?.potentialAction || []).filter(
        ({ '@type': type }) => type === 'LikeAction' || type === 'DislikeAction'
      ));

      if (reactActions.length) {
        return reactActions;
      }

      const voteActions = Object.freeze(graph.filter(({ type }) => type === 'https://schema.org/VoteAction').map(parseAction));

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

  const updateFeedbackActions = useCallback(
    (action?: OrgSchemaAction) => {
      const newActions: OrgSchemaAction[] = currentFeedbackActions.map(feedbackAction => ({
        ...feedbackAction,
        actionStatus:
          action && feedbackAction === action && action.actionStatus !== 'ActiveActionStatus'
            ? 'ActiveActionStatus'
            : 'PotentialActionStatus'
      }));
      setCurrentFeedbackActions(newActions);
    },
    [currentFeedbackActions, setCurrentFeedbackActions]
  );

  const completeSelectedAction = useCallback(() => {
    const newActions: OrgSchemaAction[] = currentFeedbackActions.map(feedbackAction => ({
      ...feedbackAction,
      actionStatus:
        feedbackAction.actionStatus === 'ActiveActionStatus' ? 'CompletedActionStatus' : 'PotentialActionStatus'
    }));
    setCurrentFeedbackActions(newActions);
  }, [currentFeedbackActions, setCurrentFeedbackActions]);

  const selectedAction = currentFeedbackActions.find(
    action => action.actionStatus === 'CompletedActionStatus' || action.actionStatus === 'ActiveActionStatus'
  );

  return { completeSelectedAction, currentFeedbackActions, updateFeedbackActions, selectedAction };
}
