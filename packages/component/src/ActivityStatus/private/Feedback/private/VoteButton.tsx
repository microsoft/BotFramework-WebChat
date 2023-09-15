import React, { memo, useCallback } from 'react';
import { useRefFrom } from 'use-ref-from';

import { type VoteAction } from '../../../../types/external/OrgSchema/VoteAction';
import ThumbsButton from './ThumbButton';

type Props = Readonly<{
  onClick?: (voteAction: VoteAction) => void;
  pressed: boolean;
  voteAction: VoteAction;
}>;

const FeedbackVoteButton = memo(({ onClick, pressed, voteAction }: Props) => {
  const onClickRef = useRefFrom(onClick);
  const voteActionRef = useRefFrom(voteAction);

  const handleClick = useCallback(() => onClickRef.current?.(voteActionRef.current), [onClickRef, voteActionRef]);

  return (
    <ThumbsButton
      direction={voteAction.actionOption === 'downvote' ? 'down' : 'up'}
      onClick={handleClick}
      pressed={pressed}
    />
  );
});

FeedbackVoteButton.displayName = 'FeedbackVoteButton';

export default FeedbackVoteButton;
