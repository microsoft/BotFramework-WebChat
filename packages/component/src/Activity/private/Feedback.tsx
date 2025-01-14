import { hooks } from 'botframework-webchat-api';
import { type OrgSchemaAction } from 'botframework-webchat-core';
import React, { Fragment, memo, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useRefFrom } from 'use-ref-from';

import FeedbackVoteButton from './VoteButton';

const { usePonyfill, usePostActivity, useLocalizer } = hooks;

type Props = Readonly<
  PropsWithChildren<{
    actions: ReadonlySet<OrgSchemaAction>;
    className?: string | undefined;
  }>
>;

const DEBOUNCE_TIMEOUT = 500;

const Feedback = memo(({ actions, className }: Props) => {
  const [{ clearTimeout, setTimeout }] = usePonyfill();
  const [selectedAction, setSelectedAction] = useState<OrgSchemaAction | undefined>();
  const postActivity = usePostActivity();
  const localize = useLocalizer();

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

  const actionProps = useMemo(
    () =>
      [...actions].some(action => action.actionStatus === 'CompletedActionStatus')
        ? {
            disabled: true,
            title: localize('VOTE_COMPLETE_ALT')
          }
        : undefined,
    [actions, localize]
  );

  return (
    <Fragment>
      {Array.from(actions).map((action, index) => (
        <FeedbackVoteButton
          action={action}
          className={className}
          key={action['@id'] || index}
          onClick={setSelectedAction}
          pressed={
            selectedAction === action ||
            action.actionStatus === 'CompletedActionStatus' ||
            action.actionStatus === 'ActiveActionStatus'
          }
          {...actionProps}
        />
      ))}
    </Fragment>
  );
});

Feedback.displayName = 'ActivityStatusFeedback';

export default Feedback;
