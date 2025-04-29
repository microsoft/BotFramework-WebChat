import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useRef, useState, type FormEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';
import useStyleSet from '../../hooks/useStyleSet';
import testIds from '../../testIds';
import TextArea from './FeedbackTextArea';
import { useRenderMarkdownAsHTML } from '../../hooks';

const { useLocalizer, usePostActivity } = hooks;

type FeedbackFormProps = Readonly<{
  disclaimer?: string;
  feedbackType: string;
  onReset: (wasFeedbackSubmitted: boolean) => void;
  replyToId?: string;
}>;

function FeedbackForm({ feedbackType, disclaimer, onReset, replyToId }: FeedbackFormProps) {
  const [{ feedbackForm }] = useStyleSet();
  const [hasFocus, setHasFocus] = useState(false);
  const [userFeedback, setUserFeedback] = useState('');
  const feedbackTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const localize = useLocalizer();
  const onResetRef = useRefFrom(onReset);
  const postActivity = usePostActivity();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML('message activity');

  const disclaimerNode = useMemo(
    () =>
      disclaimer ? (
        renderMarkdownAsHTML ? (
          <span
            className={classNames('webchat__feedback-form__caption1', feedbackForm + '')}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: renderMarkdownAsHTML(disclaimer) }}
          />
        ) : (
          <span className={classNames('webchat__feedback-form__caption1', feedbackForm + '')}>{disclaimer}</span>
        )
      ) : undefined,
    [disclaimer, feedbackForm, renderMarkdownAsHTML]
  );

  const handleReset = useCallback(
    (wasFeedbackSubmitted: boolean) => {
      setUserFeedback('');
      setHasFocus(false);
      onResetRef.current(wasFeedbackSubmitted);
    },
    [onResetRef, setHasFocus, setUserFeedback]
  );

  const handleCancel = useCallback(() => {
    handleReset(false);
  }, [handleReset]);

  const handleSubmit = useCallback(
    event => {
      event.preventDefault();

      postActivity({
        name: 'message/submitAction',
        replyToId,
        type: 'invoke',
        value: {
          actionName: 'feedback',
          actionValue: {
            feedback: { feedbackText: userFeedback },
            reaction: feedbackType === 'LikeAction' ? 'like' : 'dislike'
          }
        }
      } as any);

      handleReset(true);
    },
    [feedbackType, handleReset, postActivity, replyToId, userFeedback]
  );

  const handleChange: FormEventHandler<HTMLTextAreaElement> = useCallback(
    ({ currentTarget: { value } }) => setUserFeedback(value),
    [setUserFeedback]
  );

  useEffect(() => {
    // Will focus on the text area when:
    // 1. The component is mounted initially, or
    // 2. User clicked on the reset button
    if (feedbackTextAreaRef.current && !hasFocus) {
      setHasFocus(true);

      feedbackTextAreaRef.current.focus();
    }
  }, [feedbackTextAreaRef, hasFocus, setHasFocus]);

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
          {disclaimerNode}
        )}
        <div className={classNames('webchat__feedback-form__container', feedbackForm + '')}>
          <button className={classNames('webchat__feedback-form__button__submit', feedbackForm + '')} type="submit">
            {localize('FEEDBACK_FORM_SUBMIT_BUTTON_LABEL')}
          </button>
          <button
            className={classNames('webchat__feedback-form__button__cancel', feedbackForm + '')}
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

export { type FeedbackFormProps };
