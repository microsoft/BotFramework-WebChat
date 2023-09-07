import { hooks } from 'botframework-webchat-api';
import { useRefFrom } from 'use-ref-from';
import React, { Fragment, memo, type PropsWithChildren, useCallback, useState, useEffect } from 'react';

import { type VoteAction } from '../../../types/external/SchemaOrg/VoteAction';
import FeedbackVoteButton from './private/VoteButton';

const { usePonyfill, usePostActivity } = hooks;

type Props = PropsWithChildren<{
  voteActions: ReadonlySet<VoteAction>;
}>;

const DEBOUNCE_TIMEOUT = 500;

const Feedback = memo(({ voteActions }: Props) => {
  const [{ clearTimeout, setTimeout }] = usePonyfill();
  const [selectedVoteAction, setSelectedVoteAction] = useState<VoteAction | undefined>(undefined);
  const postActivity = usePostActivity();

  const handleChange = useCallback<(voteAction: VoteAction) => void>(
    voteAction => setSelectedVoteAction(voteAction),
    [setSelectedVoteAction]
  );

  const postActivityRef = useRefFrom(postActivity);

  useEffect(() => {
    if (!selectedVoteAction) {
      return;
    }

    const timeout = setTimeout(
      () =>
        postActivityRef.current({
          entities: [selectedVoteAction],
          name: 'webchat:activity-status/feedback',
          type: 'event'
        } as any),
      DEBOUNCE_TIMEOUT
    );

    return () => clearTimeout(timeout);
  }, [clearTimeout, postActivityRef, selectedVoteAction, setTimeout]);

  return (
    <Fragment>
      {Array.from(voteActions).map((voteAction, index) => (
        <FeedbackVoteButton
          key={voteAction['@id'] || voteAction.actionOption || index}
          onClick={handleChange}
          pressed={selectedVoteAction === voteAction}
          voteAction={voteAction}
        />
      ))}
    </Fragment>
  );
});

Feedback.displayName = 'ActivityStatusFeedback';

export default Feedback;
