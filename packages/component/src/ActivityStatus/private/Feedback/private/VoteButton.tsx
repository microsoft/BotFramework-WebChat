import React, { memo, useCallback } from 'react';
import { useRefFrom } from 'use-ref-from';

import ThumbsButton from './ThumbButton';

import { type Vote } from '../types/Vote';

type Props = {
  // "defaultProps" is being deprecated.
  // eslint-disable-next-line react/require-default-props
  onClick?: (vote: Vote) => void;
  pressed: boolean;
  // "defaultProps" is being deprecated.
  // eslint-disable-next-line react/require-default-props
  title?: string;
  vote: Vote;
};

const FeedbackVoteButton = memo(({ onClick, pressed, title, vote }: Props) => {
  const onClickRef = useRefFrom(onClick);
  const voteRef = useRefFrom(vote);

  const handleClick = useCallback(() => onClickRef.current?.(voteRef.current), [onClickRef, voteRef]);

  return (
    <ThumbsButton
      direction={vote === 'downvote' ? 'down' : 'up'}
      onClick={handleClick}
      pressed={pressed}
      title={title}
    />
  );
});

FeedbackVoteButton.displayName = 'FeedbackVoteButton';

export default FeedbackVoteButton;
