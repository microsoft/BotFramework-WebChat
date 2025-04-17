import { hooks } from 'botframework-webchat-api';
import { type OrgSchemaAction } from 'botframework-webchat-core';
import React, { Fragment, memo, useMemo, type PropsWithChildren } from 'react';

import FeedbackVoteButton from './VoteButton';

const { useLocalizer } = hooks;

type Props = Readonly<
  PropsWithChildren<{
    actions: ReadonlySet<OrgSchemaAction>;
    className?: string | undefined;
    onHandleFeedbackActionClick?: (action: OrgSchemaAction) => void;
    selectedAction?: OrgSchemaAction | undefined;
  }>
>;

const Feedback = memo(({ actions, className, onHandleFeedbackActionClick, selectedAction }: Props) => {
  const localize = useLocalizer();

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
      {[...actions].map((action, index) => (
        <FeedbackVoteButton
          action={action}
          className={className}
          key={action['@id'] || index}
          onClick={onHandleFeedbackActionClick}
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
