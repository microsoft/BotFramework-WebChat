import { hooks } from 'botframework-webchat-api';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo, useCallback, useEffect, useRef, useState, type FormEventHandler } from 'react';

import Markdownable from '../../Attachment/Text/private/Markdownable';
import testIds from '../../testIds';
import { TextArea } from '../../TextArea';
import useActivityFeedbackHooks from '../providers/useActivityFeedbackHooks';
import getDisclaimerFromReviewAction from './getDisclaimerFromReviewAction';

import styles from './FeedbackForm.module.css';

const { useLocalizer } = hooks;

function FeedbackForm() {
  const classNames = useStyles(styles);
  const { useFeedbackText, useSelectedAction } = useActivityFeedbackHooks();

  const [selectedAction] = useSelectedAction();
  const [hasFocus, setHasFocus] = useState(false);
  const [userFeedback, setUserFeedback] = useFeedbackText();
  const feedbackTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const localize = useLocalizer();

  const disclaimer = getDisclaimerFromReviewAction(selectedAction);

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
    <div className={classNames['feedback-form__form']}>
      <span className={classNames['feedback-form__form-header']}>{localize('FEEDBACK_FORM_TITLE')}</span>
      <div className={classNames['feedback-form__text-box']}>
        <TextArea
          className={classNames['feedback-form__text-area']}
          data-testid={testIds.feedbackSendBox}
          onInput={handleMessageChange}
          placeholder={localize('FEEDBACK_FORM_PLACEHOLDER')}
          ref={feedbackTextAreaRef}
          startRows={3}
          value={userFeedback}
        />
      </div>
      {disclaimer && <Markdownable className={classNames['feedback-form__form-footer']} text={disclaimer} />}
      <div className={classNames['feedback-form__submission-button-bar']}>
        <button className={classNames['feedback-form__submit-button']} type="submit">
          {localize('FEEDBACK_FORM_SUBMIT_BUTTON_LABEL')}
        </button>
        <button className={classNames['feedback-form__cancel-button']} type="reset">
          {localize('FEEDBACK_FORM_CANCEL_BUTTON_LABEL')}
        </button>
      </div>
    </div>
  );
}

export default memo(FeedbackForm);
