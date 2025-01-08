import { hooks } from 'botframework-webchat-api';
import { type OrgSchemaAction } from 'botframework-webchat-core';
import React, { Fragment, memo, useEffect, useState, type ReactNode } from 'react';
import { useRefFrom } from 'use-ref-from';

import FeedbackVoteButton from './private/VoteButton';

const { usePonyfill, usePostActivity } = hooks;

type Props = Readonly<{
  actions: ReadonlySet<OrgSchemaAction>;
  children?: ReactNode | undefined;
}>;

const DEBOUNCE_TIMEOUT = 500;

const Feedback = memo(({ actions }: Props) => {
  const [{ clearTimeout, setTimeout }] = usePonyfill();
  const [selectedAction, setSelectedAction] = useState<OrgSchemaAction | undefined>();
  const postActivity = usePostActivity();

  const postActivityRef = useRefFrom(postActivity);

  useEffect(() => {
    if (!selectedAction) {
      return;
    }

    const timeout = setTimeout(
      () =>
        // TODO: We should update this to use W3C Hydra.1
        postActivityRef.current({
          entities: [selectedAction],
          name: 'webchat:activity-status/feedback',
          type: 'event'
        } as any),
      DEBOUNCE_TIMEOUT
    );

    return () => clearTimeout(timeout);
  }, [clearTimeout, postActivityRef, selectedAction, setTimeout]);

  return (
    <Fragment>
      {Array.from(actions).map((action, index) => (
        <FeedbackVoteButton
          action={action}
          key={action['@id'] || index}
          onClick={setSelectedAction}
          pressed={selectedAction === action}
        />
      ))}
    </Fragment>
  );
});

Feedback.displayName = 'ActivityStatusFeedback';

export default Feedback;
