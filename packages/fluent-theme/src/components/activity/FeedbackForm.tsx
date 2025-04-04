import React, { memo, useState, useMemo, useCallback } from 'react';
import { hooks } from 'botframework-webchat-component';
import { useStyles } from '../../styles';
import styles from './FeedbackForm.module.css';
import { type WebChatActivity, parseThing, markActivity } from 'botframework-webchat-core';
import StackedLayout from './private/StackedLayout';
import TextArea from '../sendBox/TextArea';
import cx from 'classnames';
import testIds from '../../testIds';

const { useLocalizer, usePostActivity } = hooks;

const FeedbackOptions = {
  LikeAction: 'like',
  DislikeAction: 'dislike'
} as const;

type FeedbackType = keyof typeof FeedbackOptions;

function FeedbackForm({ activity }: Readonly<{ activity: WebChatActivity }>) {
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  const [feedback, setFeedback] = useState('');
  const postActivity = usePostActivity();

  const graph = useMemo(() => activity.entities || [], [activity.entities]);

  const messageThing = parseThing(graph[0] ?? {});

  const reactionType = messageThing?.['@type'] as FeedbackType;

  const handleSubmit = useCallback(
    event => {
      event.preventDefault();
      if (feedback) {
        postActivity({
          type: 'invoke',
          name: 'message/submitAction',
          value: {
            actionName: 'feedback',
            actionValue: {
              reaction: reactionType === 'LikeAction' ? FeedbackOptions.LikeAction : FeedbackOptions.DislikeAction,
              feedback: {
                feedbackText: feedback
              }
            }
          }
        } as any);
        if (activity.id) {
          markActivity({ id: activity.id }, 'feedbackActionClicked', true);
        }
        setFeedback('');
      }
    },
    [activity.id, feedback, postActivity, reactionType]
  );

  const handleCancel = useCallback(() => {
    setFeedback('');
    if (activity.id) {
      markActivity({ id: activity.id }, 'feedbackActionClicked', true);
    }
  }, [activity.id]);

  const handleChange = useCallback(
    event => {
      setFeedback(event.target.value);
    },
    [setFeedback]
  );

  if (!reactionType) {
    return null;
  }

  return (
    <StackedLayout activity={activity}>
      <div className={classNames['feedback-form']}>
        <span className={classNames['feedback-form__body1']}>{localize('FEEDBACK_FORM_TITLE')}</span>
        <form className={classNames['feedback-form']} onSubmit={handleSubmit}>
          <div className={cx(classNames['sendbox__sendbox'])}>
            <TextArea
              data-testid={testIds.feedbackSendBox}
              onInput={handleChange}
              placeholder={localize('FEEDBACK_FORM_PLACEHOLDER')}
              value={feedback}
            />
          </div>
          <span className={classNames['feedback-form__caption1']}>{'Test description'}</span>
          <div className={classNames['feedback-button__container']}>
            <button className={classNames['feedback-button__submit']} type="submit">
              {localize('FEEDBACK_FORM_SUBMIT_BUTTON_LABEL')}
            </button>
            <button className={classNames['feedback-button__cancel']} onClick={handleCancel} type="button">
              {localize('FEEDBACK_FORM_CANCEL_BUTTON_LABEL')}
            </button>
          </div>
        </form>
      </div>
    </StackedLayout>
  );
}
export default memo(FeedbackForm);
