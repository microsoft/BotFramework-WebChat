import React, { Fragment, memo, type PropsWithChildren, useCallback, useState, useEffect, useRef } from 'react';

import FeedbackVoteButton from './private/VoteButton';

import { type Vote } from './types/Vote';

type Props = PropsWithChildren<{
  votes: ReadonlySet<Vote>;
}>;

const DEBOUNCE_TIMEOUT = 500;

const Feedback = memo(({ votes }: Props) => {
  const [value, setValue] = useState<Vote>('initial');

  const handleChange = useCallback<(vote: Vote) => void>(
    nextVote => setValue(vote => (nextVote === vote ? 'initial' : nextVote)),
    [setValue]
  );

  const feedbackPayloadRef = useRef({});
  // TODO
  // eslint-disable-next-line
  const postFeedback = console.log.bind(console);

  useEffect(() => {
    // In the future, we should handle when the user "uncheck" the vote (`vote === 'unset'`).
    if (value === 'downvote' || value === 'upvote') {
      // TODO
      // eslint-disable-next-line
      const timeout = setTimeout(
        () =>
          postFeedback({
            ...feedbackPayloadRef.current,
            category: 'gptanswers',
            userResponse: value === 'downvote' ? 0 : 1
          }),
        DEBOUNCE_TIMEOUT
      );

      // TODO
      // eslint-disable-next-line
      return () => clearTimeout(timeout);
    }
  }, [feedbackPayloadRef, postFeedback, value]);

  return (
    <Fragment>
      {Array.from(votes).map(vote => (
        <FeedbackVoteButton key={vote} onClick={handleChange} pressed={value === vote} vote={vote} />
      ))}
    </Fragment>
  );
});

Feedback.displayName = 'ActivityStatusFeedback';

export default Feedback;
