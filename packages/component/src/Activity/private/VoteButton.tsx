import { onErrorResumeNext, parseVoteAction, type OrgSchemaAction } from 'botframework-webchat-core';
import React, { memo, useCallback, useMemo } from 'react';
import { useRefFrom } from 'use-ref-from';

import ThumbsButton from './ThumbButton';

type Props = Readonly<{
  className?: string | undefined;
  action: OrgSchemaAction;
  disabled?: boolean | undefined;
  onClick?: (action: OrgSchemaAction) => void;
  pressed: boolean;
  title?: string | undefined;
}>;

const FeedbackVoteButton = memo(({ action, className, disabled, onClick, pressed, title }: Props) => {
  const onClickRef = useRefFrom(onClick);
  const voteActionRef = useRefFrom(action);

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

  const handleClick = useCallback(() => onClickRef.current?.(voteActionRef.current), [onClickRef, voteActionRef]);

  return (
    <ThumbsButton
      className={className}
      direction={direction}
      disabled={disabled}
      onClick={handleClick}
      pressed={pressed}
      title={title}
    />
  );
});

FeedbackVoteButton.displayName = 'FeedbackVoteButton';

export default FeedbackVoteButton;
