import { hooks } from 'botframework-webchat-api';
import { type OrgSchemaVoteAction } from 'botframework-webchat-core';
import { useRefFrom } from 'use-ref-from';
import React, { Fragment, memo, type PropsWithChildren, useState, useEffect } from 'react';

import FeedbackVoteButton from './private/VoteButton';

const { usePonyfill, usePostActivity } = hooks;

type Props = Readonly<
  PropsWithChildren<{
    voteActions: ReadonlySet<OrgSchemaVoteAction>;
  }>
>;

const DEBOUNCE_TIMEOUT = 500;

const Feedback = memo(({ voteActions }: Props) => {
  const [{ clearTimeout, setTimeout }] = usePonyfill();
  const [selectedVoteAction, setSelectedVoteAction] = useState<OrgSchemaVoteAction | undefined>();
  const postActivity = usePostActivity();

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
          onClick={setSelectedVoteAction}
          pressed={selectedVoteAction === voteAction}
          voteAction={voteAction}
        />
      ))}
    </Fragment>
  );
});

Feedback.displayName = 'ActivityStatusFeedback';

export default Feedback;
