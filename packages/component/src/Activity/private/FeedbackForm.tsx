import React, { memo, useEffect, useState, useCallback, useRef } from 'react';
import { hooks } from 'botframework-webchat-api';
import useStyleSet from '../../hooks/useStyleSet';
import classNames from 'classnames';
import testIds from '../../testIds';
import TextArea from './FeedbackTextArea';
import withEmoji from '../../withEmoji/withEmoji';

const { useLocalizer, usePostActivity } = hooks;

const FeedbackOptions = {
  LikeAction: 'like',
  DislikeAction: 'dislike'
} as const;

export type FeedbackType = keyof typeof FeedbackOptions;

const MultiLineTextBox = withEmoji(TextArea);

function FeedbackForm({
  feedbackType,
  disclaimer,
  handeFeedbackTypeChange,
  replyToId
}: Readonly<{
  feedbackType: FeedbackType;
  disclaimer?: string;
  handeFeedbackTypeChange: () => void;
  replyToId?: string;
}>) {
  const [{ feedbackForm }] = useStyleSet();
  const localize = useLocalizer();
  const [feedback, setFeedback] = useState('');
  const [hasFocused, setHasFocused] = useState(false);
  const postActivity = usePostActivity();
  const feedbackTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    event => {
      event.preventDefault();
      if (feedback) {
        postActivity({
          type: 'invoke',
          name: 'message/submitAction',
          replyToId,
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
        handeFeedbackTypeChange();
      }
    },
    [feedback, postActivity, replyToId, feedbackType, handeFeedbackTypeChange]
  );

  useEffect(() => {
    if (feedbackTextAreaRef.current && !hasFocused) {
      setHasFocused(true);
      feedbackTextAreaRef.current.focus();
    }
  }, [feedbackTextAreaRef, hasFocused]);

  const handleCancel = useCallback(() => {
    setFeedback('');
    handeFeedbackTypeChange();
  }, [handeFeedbackTypeChange]);

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
        <MultiLineTextBox
          data-testid={testIds.feedbackSendBox}
          onChange={handleChange}
          placeholder={localize('FEEDBACK_FORM_PLACEHOLDER')}
          ref={feedbackTextAreaRef}
          value={feedback}
        />
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
