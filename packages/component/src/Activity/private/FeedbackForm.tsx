import React, { memo, useState, useCallback } from 'react';
import { hooks } from 'botframework-webchat-api';
import useStyleSet from '../../hooks/useStyleSet';
import classNames from 'classnames';
import testIds from '../../testIds';
import AutoResizeTextArea from '../../SendBox/AutoResizeTextArea';
import withEmoji from '../../withEmoji/withEmoji';

const { useLocalizer, usePostActivity } = hooks;

const FeedbackOptions = {
  LikeAction: 'like',
  DislikeAction: 'dislike'
} as const;

export type FeedbackType = keyof typeof FeedbackOptions;

const MultiLineTextBox = withEmoji(AutoResizeTextArea);

function FeedbackForm({
  feedbackType,
  disclaimer,
  handleCancelClick
}: Readonly<{
  feedbackType: FeedbackType;
  disclaimer?: string;
  handleCancelClick: () => void;
}>) {
  const [{ feedbackForm }] = useStyleSet();
  const localize = useLocalizer();
  const [feedback, setFeedback] = useState('');
  const postActivity = usePostActivity();

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
              reaction: feedbackType === 'LikeAction' ? FeedbackOptions.LikeAction : FeedbackOptions.DislikeAction,
              feedback: {
                feedbackText: feedback
              }
            }
          }
        } as any);
        setFeedback('');
      }
    },
    [feedback, postActivity, feedbackType]
  );

  const handleCancel = useCallback(() => {
    setFeedback('');
    handleCancelClick();
  }, [handleCancelClick]);

  const handleChange = useCallback(
    (value: string) => {
      setFeedback(value);
    },
    [setFeedback]
  );

  if (!feedbackType) {
    return null;
  }

  return (
    <div>
      <span className={classNames('feedback-form__body1', feedbackForm + '')}>{localize('FEEDBACK_FORM_TITLE')}</span>
      <form className={classNames('feedback-form', feedbackForm + '')} onSubmit={handleSubmit}>
        <div className={classNames('sendbox__sendbox', feedbackForm + '')}>
          <MultiLineTextBox
            data-testid={testIds.feedbackSendBox}
            onChange={handleChange}
            placeholder={localize('FEEDBACK_FORM_PLACEHOLDER')}
            value={feedback}
          />
        </div>
        {disclaimer && <span className={classNames('feedback-form__caption1', feedbackForm + '')}>{disclaimer}</span>}
        <div className={classNames('feedback-form__container', feedbackForm + '')}>
          <button className={classNames('feedback-form__button__submit', feedbackForm + '')} type="submit">
            {localize('FEEDBACK_FORM_SUBMIT_BUTTON_LABEL')}
          </button>
          <button
            className={classNames('feedback-form__button__cancel', feedbackForm + '')}
            onClick={handleCancel}
            type="button"
          >
            {localize('FEEDBACK_FORM_CANCEL_BUTTON_LABEL')}
          </button>
        </div>
      </form>
    </div>
  );
}
export default memo(FeedbackForm);
