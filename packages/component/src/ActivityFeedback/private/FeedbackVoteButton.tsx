import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import { orgSchemaActionSchema, orgSchemaVoteActionSchema } from 'botframework-webchat-core/org-schema.js';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { useRefFrom } from 'use-ref-from';
import { literal, object, pipe, readonly, string, union, type InferInput } from 'valibot';
import { isOfType } from 'botframework-webchat-core/json-ld.js';

import { useListenToActivityFeedbackFocus } from '../providers/private/FocusPropagation';
import useActivityFeedbackHooks from '../providers/useActivityFeedbackHooks';
import ThumbButton from './ThumbButton';
import canActionResubmit from './canActionResubmit';
import isActionRequireReview from './isActionRequireReview';

const { useLocalizer, useStyleOptions } = hooks;

const feedbackVoteButtonPropsSchema = pipe(
  object({
    action: union([orgSchemaActionSchema, orgSchemaVoteActionSchema]),
    as: union([literal('button'), literal('radio')]),
    name: string()
  }),
  readonly()
);

type FeedbackVoteButtonProps = InferInput<typeof feedbackVoteButtonPropsSchema>;

function FeedbackVoteButton(props: FeedbackVoteButtonProps) {
  const { useHasSubmitted, useSelectedAction: useSelectedActions } = useActivityFeedbackHooks();

  const { action, as, name } = validateProps(feedbackVoteButtonPropsSchema, props);

  const [{ feedbackActionsPlacement }] = useStyleOptions();
  const [hasSubmitted] = useHasSubmitted();
  const [selectedAction, setSelectedAction] = useSelectedActions();
  const actionRef = useRefFrom(action);
  const buttonRef = useRef<HTMLInputElement>(null);
  const direction = useMemo(() => {
    if (isOfType('DislikeAction', action)) {
      return 'down';
    } else if (isOfType('LikeAction', action)) {
      return 'up';
    } else if (isOfType('VoteAction', action)) {
      if (action.actionOption[0] === 'downvote') {
        return 'down';
      } else if (action.actionOption[0] === 'upvote') {
        return 'up';
      }
    }

    console.warn(
      'botframework-webchat: <FeedbackVoteButton> supports `DislikeAction`, `LikeAction`, and `VoteAction` with `actionOption` of "downvote" and "upvote" only.'
    );

    return 'up';
  }, [action]);
  const localize = useLocalizer();

  const selectedActionRef = useRefFrom(selectedAction);

  const handleClick = useCallback(
    () => setSelectedAction(actionRef.current === selectedActionRef.current ? undefined : actionRef.current),
    [actionRef, selectedActionRef, setSelectedAction]
  );
  const disabled = hasSubmitted && !canActionResubmit(action);

  useListenToActivityFeedbackFocus(
    useCallback(target => target === actionRef.current && buttonRef.current?.focus(), [actionRef])
  );

  return (
    <ThumbButton
      as={as}
      direction={direction}
      disabled={disabled}
      name={name}
      onClick={handleClick}
      pressed={selectedAction === action}
      ref={buttonRef}
      size={isActionRequireReview(action) || feedbackActionsPlacement === 'activity-actions' ? 'large' : 'small'}
      submitted={hasSubmitted}
      title={disabled ? localize('VOTE_COMPLETE_ALT') : undefined}
    />
  );
}

export default memo(FeedbackVoteButton);
export { feedbackVoteButtonPropsSchema, type FeedbackVoteButtonProps };
