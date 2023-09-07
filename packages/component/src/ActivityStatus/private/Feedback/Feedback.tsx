import { useRefFrom } from 'use-ref-from';
import React, { Fragment, memo, type PropsWithChildren, useCallback, useState, useEffect } from 'react';

import { hooks } from 'botframework-webchat-api';
import { type Vote } from './types/Vote';
import FeedbackVoteButton from './private/VoteButton';

const { usePonyfill, usePostActivity } = hooks;

type Props = PropsWithChildren<{
  votes: ReadonlySet<Vote>;
}>;

const DEBOUNCE_TIMEOUT = 500;

const Feedback = memo(({ votes }: Props) => {
  const [{ clearTimeout, setTimeout }] = usePonyfill();
  const [selectedVote, setSelectedVote] = useState<Vote | undefined>(undefined);
  const postActivity = usePostActivity();

  const handleChange = useCallback<(vote: Vote) => void>(vote => setSelectedVote(vote), [setSelectedVote]);
  const postActivityRef = useRefFrom(postActivity);

  useEffect(() => {
    if (!selectedVote) {
      return;
    }

    const timeout = setTimeout(
      () =>
        postActivityRef.current({
          entities: [selectedVote],
          name: 'webchat:activity-status/feedback',
          type: 'event'
        } as any),
      DEBOUNCE_TIMEOUT
    );

    return () => clearTimeout(timeout);
  }, [clearTimeout, postActivityRef, selectedVote, setTimeout]);

  return (
    <Fragment>
      {Array.from(votes).map(vote => (
        <FeedbackVoteButton key={vote} onClick={handleChange} pressed={selectedVote === vote} vote={vote} />
      ))}
    </Fragment>
  );
});

Feedback.displayName = 'ActivityStatusFeedback';

export default Feedback;
