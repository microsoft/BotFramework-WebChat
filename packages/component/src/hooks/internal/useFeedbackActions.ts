import {
  getOrgSchemaMessage,
  OrgSchemaAction,
  orgSchemaActionSchema,
  WebChatActivity
} from 'botframework-webchat-core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRefFrom } from 'use-ref-from';
import { parse } from 'valibot';
import dereferenceBlankNodes from '../../Utils/JSONLinkedData/dereferenceBlankNodes';

export default function useFeedbackActions(initialActivity: WebChatActivity): {
  actions: readonly OrgSchemaAction[];
  isCompleted: boolean;
  markActionAsCompleted: (target: OrgSchemaAction) => void;
  markActionAsSelected: (target: OrgSchemaAction) => void;
  selectedAction: OrgSchemaAction;
} {
  // We can react to activity changes by throwing away our currentFeedbackActions, but saving some code for now.
  useEffect(() => {
    console.warn(
      'botframework-webchat: useFeedbackActions() is skipping changes made to the activity.',
      initialActivity
    );
  }, [initialActivity]);

  const [actions, setActions] = useState<readonly OrgSchemaAction[]>(() => {
    try {
      const graph = dereferenceBlankNodes(initialActivity.entities || []);
      const messageThing = getOrgSchemaMessage(graph);

      const reactActions = Object.freeze(
        messageThing?.potentialAction.filter(({ '@type': type }) => type === 'LikeAction' || type === 'DislikeAction')
      );

      if (reactActions.length) {
        return reactActions;
      }

      const voteActions = Object.freeze(
        graph
          .filter(({ type }) => type === 'https://schema.org/VoteAction')
          .map(action => parse(orgSchemaActionSchema, action))
      );

      if (voteActions.length) {
        return voteActions;
      }
    } catch {
      // Intentionally left blank.
    }

    return Object.freeze([]);
  });

  const isCompleted = useMemo<boolean>(
    () => actions.some(action => action.actionStatus?.[0] === 'CompletedActionStatus'),
    [actions]
  );

  const isCompletedRef = useRefFrom(isCompleted);

  const markActionAsSelected = useCallback(
    (target: OrgSchemaAction) => {
      if (isCompletedRef.current) {
        return console.warn(
          'botframework-webchat internal: useFeedbackActions().markActionAsSelected() must not be called after feedback is completed, ignoring the call.'
        );
      }

      setActions(actions =>
        Object.freeze(
          actions.map(action =>
            action === target
              ? Object.freeze({ ...action, actionStatus: ['ActiveActionStatus'] } satisfies OrgSchemaAction)
              : action.actionStatus?.[0] === 'ActiveActionStatus'
                ? Object.freeze({ ...action, actionStatus: ['PotentialActionStatus'] } satisfies OrgSchemaAction)
                : action
          )
        )
      );
    },
    [isCompletedRef, setActions]
  );

  const markActionAsCompleted = useCallback(
    (target: OrgSchemaAction) => {
      if (isCompletedRef.current) {
        return console.warn(
          'botframework-webchat internal: useFeedbackActions().markActionAsCompleted() must not be called after feedback is completed, ignoring the call.'
        );
      }

      setActions(actions =>
        Object.freeze(
          actions.map(action =>
            action === target
              ? Object.freeze({ ...action, actionStatus: ['CompletedActionStatus'] } satisfies OrgSchemaAction)
              : action
          )
        )
      );
    },
    [isCompletedRef, setActions]
  );

  const selectedAction = useMemo(
    () =>
      actions.find(
        ({ actionStatus }) =>
          actionStatus?.[0] === 'ActiveActionStatus' || actionStatus?.[0] === 'CompletedActionStatus'
      ),
    [actions]
  );

  return {
    actions,
    isCompleted,
    markActionAsCompleted,
    markActionAsSelected,
    selectedAction
  };
}
