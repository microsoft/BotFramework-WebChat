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

const MultiLineTextBox = withEmoji(TextArea);

function FeedbackForm({
  feedbackType,
  disclaimer,
  onResetFeedbackForm,
  replyToId
}: Readonly<{
  feedbackType: string;
  disclaimer?: string;
  onResetFeedbackForm: () => void;
  replyToId?: string;
}>) {
  const feedbackTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const [{ feedbackForm }] = useStyleSet();
  const [hasFocused, setHasFocused] = useState(false);
  const localize = useLocalizer();
  const postActivity = usePostActivity();
  const [userFeedback, setUserFeedback] = useState('');

  const handleReset = useCallback(() => {
    setUserFeedback('');
    onResetFeedbackForm();
    setHasFocused(false);
  }, [onResetFeedbackForm]);

  const handleSubmit = useCallback(
    event => {
      event.preventDefault();
      postActivity({
        type: 'invoke',
        name: 'message/submitAction',
        replyToId,
        value: {
          actionName: 'feedback',
          actionValue: {
            reaction: feedbackType === 'LikeAction' ? FeedbackOptions.LikeAction : FeedbackOptions.DislikeAction,
            feedback: {
              feedbackText: userFeedback
            }
          }
        }
      } as any);
      handleReset();
    },
    [postActivity, replyToId, feedbackType, handleReset, userFeedback]
  );

  const handleChange: React.FormEventHandler<HTMLTextAreaElement> = useCallback(
    event => {
      setUserFeedback(event.currentTarget.value);
    },
    [setUserFeedback]
  );

  useEffect(() => {
    if (feedbackTextAreaRef.current && !hasFocused) {
      setHasFocused(true);
      feedbackTextAreaRef.current.focus();
    }
  }, [feedbackTextAreaRef, hasFocused]);

  return (
    <div>
      <span className={classNames('webchat__feedback-form__body1', feedbackForm + '')}>
        {localize('FEEDBACK_FORM_TITLE')}
      </span>
      <form className={classNames('webchat__feedback-form', feedbackForm + '')} onSubmit={handleSubmit}>
        <MultiLineTextBox
          data-testid={testIds.feedbackSendBox}
          onInput={handleChange}
          placeholder={localize('FEEDBACK_FORM_PLACEHOLDER')}
          ref={feedbackTextAreaRef}
          value={userFeedback}
        />
        {disclaimer && (
          <span className={classNames('webchat__feedback-form__caption1', feedbackForm + '')}>{disclaimer}</span>
        )}
        <div className={classNames('webchat__feedback-form__container', feedbackForm + '')}>
          <button className={classNames('webchat__feedback-form__button__submit', feedbackForm + '')} type="submit">
            {localize('FEEDBACK_FORM_SUBMIT_BUTTON_LABEL')}
          </button>
          <button
            className={classNames('webchat__feedback-form__button__cancel', feedbackForm + '')}
            onClick={handleReset}
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
