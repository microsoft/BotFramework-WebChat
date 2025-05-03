import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useRef, useState, type FormEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';
import { useStateWithRef } from 'use-state-with-ref';

import Markdownable from '../../Attachment/Text/private/Markdownable';
import useStyleSet from '../../hooks/useStyleSet';
import testIds from '../../testIds';
import useActivity from '../providers/useActivity';
import useSelectedAction from '../providers/useSelectedAction';
import useSubmitCallback from '../providers/useSubmitCallback';
import FeedbackTextArea from './FeedbackTextArea';
import getDisclaimer from './getDisclaimer';

const { useLocalizer } = hooks;

function FeedbackForm() {
  const [{ feedbackForm }] = useStyleSet();
  const [activity] = useActivity();
  const [hasFocus, setHasFocus] = useState(false);
  const [selectedAction, setSelectedAction] = useSelectedAction();
  const [userFeedback, setUserFeedback, userFeedbackRef] = useStateWithRef('');
  const feedbackTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const localize = useLocalizer();
  const submit = useSubmitCallback();

  const disclaimer = getDisclaimer(activity);
  const selectedActionRef = useRefFrom(selectedAction);

  const handleCancelButtonClick = useCallback(() => {
    setSelectedAction(undefined);
  }, [setSelectedAction]);

  const handleMessageChange: FormEventHandler<HTMLTextAreaElement> = useCallback(
    ({ currentTarget: { value } }) => setUserFeedback(value),
    [setUserFeedback]
  );

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    event => {
      event.preventDefault();

      submit(selectedActionRef.current, userFeedbackRef.current);
    },
    [selectedActionRef, submit, userFeedbackRef]
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
    <form className={classNames('webchat__feedback-form', feedbackForm + '')} onSubmit={handleSubmit}>
      <span className={classNames('webchat__feedback-form__body')}>{localize('FEEDBACK_FORM_TITLE')}</span>
      <FeedbackTextArea
        data-testid={testIds.feedbackSendBox}
        onInput={handleMessageChange}
        placeholder={localize('FEEDBACK_FORM_PLACEHOLDER')}
        ref={feedbackTextAreaRef}
        startRows={3}
        value={userFeedback}
      />
      {disclaimer && <Markdownable className={classNames('webchat__feedback-form__caption')} text={disclaimer} />}
      <div className={classNames('webchat__feedback-form__container')}>
        <button className={classNames('webchat__feedback-form__submit-button')} type="submit">
          {localize('FEEDBACK_FORM_SUBMIT_BUTTON_LABEL')}
        </button>
        <button
          className={classNames('webchat__feedback-form__cancel-button')}
          onClick={handleCancelButtonClick}
          type="button"
        >
          {localize('FEEDBACK_FORM_CANCEL_BUTTON_LABEL')}
        </button>
      </div>
    </form>
  );
}

export default memo(FeedbackForm);
