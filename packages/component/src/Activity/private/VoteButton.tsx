import { onErrorResumeNext, parseVoteAction, type OrgSchemaAction } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { memo, useCallback, useMemo } from 'react';
import { useRefFrom } from 'use-ref-from';

import ThumbsButton from './ThumbButton';

type Props = Readonly<{
  className?: string | undefined;
  action: OrgSchemaAction;
  onClick?: (action: OrgSchemaAction) => void;
  pressed: boolean;
}>;

const FeedbackVoteButton = memo(({ action, className, onClick, pressed }: Props) => {
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
      className={cx(className, {
        'webchat__thumb-button--is-complete': action.actionStatus === 'CompletedActionStatus'
      })}
      direction={direction}
      onClick={handleClick}
      pressed={pressed}
    />
  );
});

FeedbackVoteButton.displayName = 'FeedbackVoteButton';

export default FeedbackVoteButton;
