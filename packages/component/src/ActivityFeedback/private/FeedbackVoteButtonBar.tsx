import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo } from 'react';
import { literal, object, pipe, readonly, union, type InferInput } from 'valibot';

import useActivityFeedbackHooks from '../providers/useActivityFeedbackHooks';
import FeedbackVoteButton from './FeedbackVoteButton';

import styles from './FeedbackForm.module.css';

const feedbackVoteButtonBarPropsSchema = pipe(
  object({
    buttonAs: union([literal('button'), literal('radio')])
  }),
  readonly()
);

type FeedbackVoteButtonBarProps = InferInput<typeof feedbackVoteButtonBarPropsSchema>;

function FeedbackVoteButtonBar(props: FeedbackVoteButtonBarProps) {
  const classNames = useStyles(styles);
  const { buttonAs } = validateProps(feedbackVoteButtonBarPropsSchema, props);

  const { useActions } = useActivityFeedbackHooks();

  const [actions] = useActions();

  return (
    <div className={classNames['feedback-form__vote-button-bar']}>
      {actions.map((action, index) => (
        <FeedbackVoteButton action={action} as={buttonAs} key={action['@id'] || index} />
      ))}
    </div>
  );
}

export default memo(FeedbackVoteButtonBar);
export { feedbackVoteButtonBarPropsSchema, type FeedbackVoteButtonBarProps };
