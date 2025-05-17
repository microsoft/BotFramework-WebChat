import { hooks } from 'botframework-webchat-api';
import { validateProps } from 'botframework-webchat-api/internal';
import {
  getOrgSchemaMessage,
  parseAction,
  type OrgSchemaAction,
  type WebChatActivity
} from 'botframework-webchat-core';
import random from 'math-random';
import React, { memo, useCallback, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { wrapWith } from 'react-wrap-with';
import { useRefFrom } from 'use-ref-from';
import { useStateWithRef } from 'use-state-with-ref';
import { custom, object, optional, pipe, readonly, safeParse, type InferInput } from 'valibot';

import reactNode from '../../types/internal/reactNode';
import dereferenceBlankNodes from '../../Utils/JSONLinkedData/dereferenceBlankNodes';
import hasFeedbackLoop from '../private/hasFeedbackLoop';
import ActivityFeedbackContext, { type ActivityFeedbackContextType } from './private/ActivityFeedbackContext';
import { ActivityFeedbackFocusPropagationScope, usePropagateActivityFeedbackFocus } from './private/FocusPropagation';

const { usePonyfill, usePostActivity } = hooks;

const activityFeedbackComposerPropsSchema = pipe(
  object({
    activity: custom<WebChatActivity>(value => safeParse(object({}), value).success),
    children: optional(reactNode())
  }),
  readonly()
);

type ActivityFeedbackComposerProps = InferInput<typeof activityFeedbackComposerPropsSchema>;

type ActionState = Readonly<{
  actionId: string;
  actionStatus: 'CompletedActionStatus' | 'ActiveActionStatus';
}>;

const DEBOUNCE_TIMEOUT = 500;

function ActivityFeedbackComposer(props: ActivityFeedbackComposerProps) {
  const { children, activity: activityFromProps } = validateProps(activityFeedbackComposerPropsSchema, props);

  const [{ clearTimeout, setTimeout }] = usePonyfill();
  const [feedbackText, setFeedbackText, feedbackTextRef] = useStateWithRef<string | undefined>();
  const activity = useMemo(
    () =>
      // Force enable feedback loop until service fixed their issue.
      hasFeedbackLoop(activityFromProps)
        ? Object.freeze({
            ...activityFromProps,
            entities: [
              {
                '@context': 'https://schema.org',
                '@id': '',
                '@type': 'Message',
                type: 'https://schema.org/Message',
                keywords: [],
                potentialAction: [
                  { '@type': 'LikeAction', actionStatus: 'PotentialActionStatus' },
                  { '@type': 'DislikeAction', actionStatus: 'PotentialActionStatus' }
                ]
              }
            ]
          })
        : activityFromProps,
    [activityFromProps]
  );

  const activityRef = useRefFrom(activity);

  const actionStateRef = useRef<ActionState | undefined>(undefined);
  const [_, setForceRefresh] = useState({});

  const setActionStateWithRefresh = useCallback(
    (actionState: ActionState | undefined) => {
      actionStateRef.current = actionState;
      setForceRefresh({});
    },
    [actionStateRef, setForceRefresh]
  );

  const rawActions = useMemo<readonly OrgSchemaAction[]>(() => {
    function patchActions(actions: readonly OrgSchemaAction[]) {
      return actions.map(action =>
        // eslint-disable-next-line no-magic-numbers
        action['@id'] ? action : Object.freeze({ ...action, '@id': `_:${random().toString(36).substring(2, 7)}` })
      );
    }

    try {
      const graph = dereferenceBlankNodes(activity.entities || []);
      const messageThing = getOrgSchemaMessage(graph);

      const reactActions = Object.freeze(
        (messageThing?.potentialAction || []).filter(
          ({ '@type': type }) => type === 'LikeAction' || type === 'DislikeAction'
        )
      );

      if (reactActions.length) {
        // actionStateRef.current = reactActions.
        return patchActions(reactActions);
      }

      const voteActions = Object.freeze(
        graph.filter(({ type }) => type === 'https://schema.org/VoteAction').map(parseAction)
      );

      if (voteActions.length) {
        return patchActions(voteActions);
      }
    } catch {
      // Intentionally left blank.
    }

    return Object.freeze([]);
  }, [activity]);

  useMemo(() => {
    const activeOrCompletedAction = rawActions.find(
      (action): action is OrgSchemaAction & { actionStatus: 'ActiveActionStatus' | 'CompletedActionStatus' } =>
        action.actionStatus === 'ActiveActionStatus' || action.actionStatus === 'CompletedActionStatus'
    );

    actionStateRef.current = activeOrCompletedAction
      ? {
          actionId: activeOrCompletedAction['@id'],
          actionStatus: activeOrCompletedAction.actionStatus
        }
      : undefined;
  }, [rawActions]);

  // Workaround ESLint on saying actionStateRef.current is redundant when using it directly.
  const actionStateForActions = actionStateRef.current;

  const actions = useMemo(
    () =>
      Object.freeze(
        rawActions.map(action =>
          actionStateForActions && actionStateForActions.actionId === action['@id']
            ? Object.freeze({ ...action, actionStatus: actionStateForActions.actionStatus })
            : action.actionStatus === 'PotentialActionStatus'
              ? action
              : Object.freeze({ ...action, actionStatus: 'PotentialActionStatus' })
        )
      ),
    [actionStateForActions, rawActions]
  );

  const actionsRef = useRefFrom(actions);

  const postActivity = usePostActivity();

  const hasSubmitted = useMemo<boolean>(
    () => actions.some(action => action.actionStatus === 'CompletedActionStatus'),
    [actions]
  );

  const hasSubmittedRef = useRefFrom(hasSubmitted);

  const submit = useCallback(
    (action: OrgSchemaAction) => {
      if (actionStateRef.current?.actionStatus === 'CompletedActionStatus') {
        return console.warn(
          'botframework-webchat internal: useFeedbackActions().submitCallback() must not be called after feedback is completed, ignoring the call.'
        );
      } else if (!actionsRef.current.includes(action)) {
        return console.warn(
          'botframework-webchat internal: Cannot submit an action that does not exists in the message, ignoring the call.'
        );
      }

      setActionStateWithRefresh(Object.freeze({ actionId: action['@id'], actionStatus: 'CompletedActionStatus' }));

      const { '@id': _id, actionStatus: _actionStatus, ...rest } = action;
      const { current: feedbackText } = feedbackTextRef;
      const isLegacyAction = action['@type'] === 'VoteAction';

      // TODO: We should update this to use W3C Hydra.1
      if (typeof feedbackText !== 'undefined') {
        postActivity({
          name: 'message/submitAction',
          replyToId: activityRef.current.id,
          type: 'invoke',
          value: {
            actionName: 'feedback',
            actionValue: {
              feedback: { feedbackText },
              reaction: action['@type'] === 'LikeAction' ? 'like' : 'dislike'
            }
          }
        } as any);
      } else {
        postActivity({
          entities: [isLegacyAction ? rest : action],
          name: 'webchat:activity-status/feedback',
          type: 'event'
        } as any);
      }
    },
    [actionsRef, actionStateRef, activityRef, feedbackTextRef, postActivity, setActionStateWithRefresh]
  );

  const shouldShowFeedbackForm = hasFeedbackLoop(activity);

  const shouldShowFeedbackFormRef = useRefFrom(shouldShowFeedbackForm);
  const shouldShowFeedbackFormState = useMemo<readonly [boolean]>(
    () => Object.freeze([shouldShowFeedbackForm] as const),
    [shouldShowFeedbackForm]
  );

  // TODO: What's the proper logic of "allow resubmission"?
  //       Right now, if feedback form is not shown, it will allow resubmission.
  const shouldAllowResubmit = !shouldShowFeedbackForm;

  const shouldAllowResubmitRef = useRefFrom(shouldAllowResubmit);
  const shouldAllowResubmitState = useMemo<readonly [boolean]>(
    () => Object.freeze([shouldAllowResubmit]),
    [shouldAllowResubmit]
  );

  const selectedAction = useMemo<OrgSchemaAction | undefined>(
    () =>
      actions.find(
        ({ actionStatus }) => actionStatus === 'ActiveActionStatus' || actionStatus === 'CompletedActionStatus'
      ),
    [actions]
  );

  const autoSubmitTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const setSelectedAction = useCallback(
    (action: OrgSchemaAction | undefined) => {
      if (hasSubmittedRef.current && !shouldAllowResubmitRef.current) {
        return console.warn(
          'botframework-webchat internal: useFeedbackActions().setSelectedAction() must not be called after feedback is completed as it does not allow resubmission, ignoring the call.'
        );
      } else if (action && !actionsRef.current.includes(action)) {
        return console.warn(
          'botframework-webchat internal: Cannot select an action that does not exists in the message, ignoring the call.'
        );
      }

      setActionStateWithRefresh(
        action
          ? Object.freeze({
              actionId: action['@id'],
              actionStatus: 'ActiveActionStatus'
            })
          : undefined
      );

      if (!shouldShowFeedbackFormRef.current) {
        clearTimeout(autoSubmitTimeoutRef.current);

        if (action?.['@id']) {
          autoSubmitTimeoutRef.current = setTimeout(
            () => submit(actionsRef.current.find(({ '@id': id }) => id === action['@id'])),
            DEBOUNCE_TIMEOUT
          );
        }
      }
    },
    [
      actionsRef,
      autoSubmitTimeoutRef,
      clearTimeout,
      hasSubmittedRef,
      setActionStateWithRefresh,
      setTimeout,
      shouldAllowResubmitRef,
      shouldShowFeedbackFormRef,
      submit
    ]
  );

  const selectedActionState = useMemo<readonly [OrgSchemaAction, (action: OrgSchemaAction) => void]>(
    () => Object.freeze([selectedAction, setSelectedAction]),
    [selectedAction, setSelectedAction]
  );

  const actionsState = useMemo<readonly [readonly OrgSchemaAction[]]>(
    () => Object.freeze([actions] as const),
    [actions]
  );

  const feedbackTextState = useMemo<readonly [string, Dispatch<SetStateAction<string>>]>(
    () => Object.freeze([feedbackText, setFeedbackText]),
    [feedbackText, setFeedbackText]
  );

  const hasSubmittedState = useMemo<readonly [boolean]>(() => Object.freeze([hasSubmitted]), [hasSubmitted]);

  const activityState = useMemo<readonly [WebChatActivity]>(() => Object.freeze([activity]), [activity]);
  const focusFeedbackButton = usePropagateActivityFeedbackFocus();

  const useActions = useCallback(() => actionsState, [actionsState]);
  const useActivity = useCallback(() => activityState, [activityState]);
  const useFeedbackText = useCallback(() => feedbackTextState, [feedbackTextState]);
  const useFocusFeedbackButton = useCallback(() => focusFeedbackButton, [focusFeedbackButton]);
  const useHasSubmitted = useCallback(() => hasSubmittedState, [hasSubmittedState]);
  const useSelectedActions = useCallback(() => selectedActionState, [selectedActionState]);
  const useShouldAllowResubmit = useCallback(() => shouldAllowResubmitState, [shouldAllowResubmitState]);
  const useShouldShowFeedbackForm = useCallback(() => shouldShowFeedbackFormState, [shouldShowFeedbackFormState]);
  const useSubmit = useCallback(() => submit, [submit]);

  const context = useMemo<ActivityFeedbackContextType>(
    () => ({
      useActions,
      useActivity,
      useFeedbackText,
      useFocusFeedbackButton,
      useHasSubmitted,
      useSelectedActions,
      useShouldAllowResubmit,
      useShouldShowFeedbackForm,
      useSubmit
    }),
    [
      useActions,
      useActivity,
      useFeedbackText,
      useFocusFeedbackButton,
      useHasSubmitted,
      useSelectedActions,
      useShouldAllowResubmit,
      useShouldShowFeedbackForm,
      useSubmit
    ]
  );

  return <ActivityFeedbackContext.Provider value={context}>{children}</ActivityFeedbackContext.Provider>;
}

export default memo(wrapWith(ActivityFeedbackFocusPropagationScope)(ActivityFeedbackComposer));
export { activityFeedbackComposerPropsSchema, type ActivityFeedbackComposerProps };
