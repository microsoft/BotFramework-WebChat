import { hooks } from 'botframework-webchat-api';
import { onErrorResumeNext, parseVoteAction, type OrgSchemaAction } from 'botframework-webchat-core';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { useRefFrom } from 'use-ref-from';

import { useListenToFocus } from '../providers/private/FocusPropagation';
import useHasSubmitted from '../providers/useHasSubmitted';
import useSelectedAction from '../providers/useSelectedAction';
import useShouldAllowResubmit from '../providers/useShouldAllowResubmit';
import useShouldShowFeedbackForm from '../providers/useShouldShowFeedbackForm';
import ThumbButton from './ThumbButton';

const { useLocalizer, useStyleOptions } = hooks;

type FeedbackVoteButtonProps = Readonly<{
  action: OrgSchemaAction;
}>;

function FeedbackVoteButton({ action }: FeedbackVoteButtonProps) {
  const [{ feedbackActionsPlacement }] = useStyleOptions();
  const [hasSubmitted] = useHasSubmitted();
  const [selectedAction, setSelectedAction] = useSelectedAction();
  const [shouldAllowResubmit] = useShouldAllowResubmit();
  const [shouldShowFeedbackForm] = useShouldShowFeedbackForm();
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
  const disabled = hasSubmitted && !shouldAllowResubmit;

  useListenToFocus(useCallback(target => target === actionRef.current && buttonRef.current?.focus(), [actionRef]));

  return (
    <ThumbButton
      direction={direction}
      disabled={disabled}
      onClick={handleClick}
      pressed={selectedAction === action}
      ref={buttonRef}
      size={shouldShowFeedbackForm || feedbackActionsPlacement === 'activity-actions' ? 'large' : 'small'}
      submitted={hasSubmitted}
      title={disabled ? localize('VOTE_COMPLETE_ALT') : undefined}
    />
  );
}

export default memo(FeedbackVoteButton);
export { type FeedbackVoteButtonProps };
