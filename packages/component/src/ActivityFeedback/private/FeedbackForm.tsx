import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useRef, useState, type FormEventHandler } from 'react';

import Markdownable from '../../Attachment/Text/private/Markdownable';
import useStyleSet from '../../hooks/useStyleSet';
import testIds from '../../testIds';
import useActivity from '../providers/useActivity';
import FeedbackTextArea from './FeedbackTextArea';
import getDisclaimer from './getDisclaimer';

const { useLocalizer } = hooks;

function FeedbackForm() {
  const [{ feedbackForm }] = useStyleSet();
  const [activity] = useActivity();
  const [hasFocus, setHasFocus] = useState(false);
  const [userFeedback, setUserFeedback] = useState('');
  const feedbackTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const localize = useLocalizer();

  const disclaimer = getDisclaimer(activity);

  const handleMessageChange: FormEventHandler<HTMLTextAreaElement> = useCallback(
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
    <div className={classNames('webchat__feedback-form', feedbackForm + '')}>
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
        <button className={classNames('webchat__feedback-form__cancel-button')} type="reset">
          {localize('FEEDBACK_FORM_CANCEL_BUTTON_LABEL')}
        </button>
      </div>
    </div>
  );
}

export default memo(FeedbackForm);
