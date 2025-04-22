import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import useStyleSet from '../../hooks/useStyleSet';
import testIds from '../../testIds';
import TextArea from './FeedbackTextArea';

const { useLocalizer, usePostActivity } = hooks;

type FeedbackFormProps = Readonly<{
  disclaimer?: string;
  feedbackType: string;
  onReset: () => void;
  replyToId?: string;
}>;

function FeedbackForm({ feedbackType, disclaimer, onReset, replyToId }: FeedbackFormProps) {
  const [{ feedbackForm }] = useStyleSet();
  const [hasFocused, setHasFocused] = useState(false);
  const [userFeedback, setUserFeedback] = useState('');
  const feedbackTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const localize = useLocalizer();
  const postActivity = usePostActivity();

  const handleReset = useCallback(() => {
    setUserFeedback('');

    onReset();

    setHasFocused(false);
  }, [onReset, setHasFocused, setUserFeedback]);

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
            reaction: feedbackType === 'LikeAction' ? 'like' : 'dislike',
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
  }, [feedbackTextAreaRef, hasFocused, setHasFocused]);

  return (
    <div>
      <span className={classNames('webchat__feedback-form__body1', feedbackForm + '')}>
        {localize('FEEDBACK_FORM_TITLE')}
      </span>
      <form className={classNames('webchat__feedback-form', feedbackForm + '')} onSubmit={handleSubmit}>
        <TextArea
          data-testid={testIds.feedbackSendBox}
          onInput={handleChange}
          placeholder={localize('FEEDBACK_FORM_PLACEHOLDER')}
          ref={feedbackTextAreaRef}
          startRows={3}
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

export { type FeedbackFormProps };
