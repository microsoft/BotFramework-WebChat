import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import { onErrorResumeNext, parseVoteAction, type OrgSchemaAction } from 'botframework-webchat-core';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { useRefFrom } from 'use-ref-from';
import { custom, literal, object, optional, pipe, readonly, safeParse, union, type InferInput } from 'valibot';

import { useListenToActivityFeedbackFocus } from '../providers/private/FocusPropagation';
import useActivityFeedbackHooks from '../providers/useActivityFeedbackHooks';
import ThumbButton from './ThumbButton';
import canActionResubmit from './canActionResubmit';
import isActionRequireReview from './isActionRequireReview';

const { useLocalizer, useStyleOptions } = hooks;

const feedbackVoteButtonPropsSchema = pipe(
  object({
    action: custom<OrgSchemaAction>(
      value =>
        safeParse(
          union([
            object({
              '@type': union([literal('DislikeAction'), literal('LikeAction')])
            }),
            object({
              '@type': literal('VoteAction'),
              actionOption: optional(union([literal('downvote'), literal('upvote')]))
            })
          ]),
          value
        ).success
    ),
    as: union([literal('button'), literal('radio')])
  }),
  readonly()
);

type FeedbackVoteButtonProps = InferInput<typeof feedbackVoteButtonPropsSchema>;

function FeedbackVoteButton(props: FeedbackVoteButtonProps) {
  const { useHasSubmitted, useSelectedAction: useSelectedActions } = useActivityFeedbackHooks();

  const { action, as } = validateProps(feedbackVoteButtonPropsSchema, props);

  const [{ feedbackActionsPlacement }] = useStyleOptions();
  const [hasSubmitted] = useHasSubmitted();
  const [selectedAction, setSelectedAction] = useSelectedActions();
  const actionRef = useRefFrom(action);
  const buttonRef = useRef<HTMLInputElement>(null);
  const direction = useMemo(() => {
    if (
      action['@type'] === 'DislikeAction' ||
      (action['@type'] === 'VoteAction' &&
        onErrorResumeNext(() => parseVoteAction(action))?.actionOption === 'downvote')
    ) {
      return 'down';
    }

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
