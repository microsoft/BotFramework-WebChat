import { validateProps } from 'botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { literal, object, pipe, readonly, union, type InferInput } from 'valibot';

import useActivityFeedbackHooks from '../providers/useActivityFeedbackHooks';
import FeedbackVoteButton from './FeedbackVoteButton';

const feedbackVoteButtonBarPropsSchema = pipe(
  object({
    buttonAs: union([literal('button'), literal('radio')])
  }),
  readonly()
);

type FeedbackVoteButtonBarProps = InferInput<typeof feedbackVoteButtonBarPropsSchema>;

function FeedbackVoteButtonBar(props: FeedbackVoteButtonBarProps) {
  const { buttonAs } = validateProps(feedbackVoteButtonBarPropsSchema, props);

  const { useActions } = useActivityFeedbackHooks();

  const [actions] = useActions();

  return (
    <div className="webchat__feedback-form__vote-button-bar">
      {actions.map((action, index) => (
        <FeedbackVoteButton action={action} as={buttonAs} key={action['@id'] || index} />
      ))}
    </div>
  );
}

export default memo(FeedbackVoteButtonBar);
export { feedbackVoteButtonBarPropsSchema, type FeedbackVoteButtonBarProps };
