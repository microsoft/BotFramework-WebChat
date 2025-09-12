import { hooks } from 'botframework-webchat-api';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo, useCallback, useEffect, useRef, useState, type FormEventHandler } from 'react';
import useUniqueId from '../../hooks/internal/useUniqueId';
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
  const feedbackFormHeaderId = useUniqueId('feedback-form__form-header__id');
  const disclaimerId = useUniqueId('feedback-form__form-footer__id');

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
      <span
        className={classNames['feedback-form__form-header']}
        // "id" is required for "aria-labelledby"
        // eslint-disable-next-line react/forbid-dom-props
        id={feedbackFormHeaderId}
      >
        {localize('FEEDBACK_FORM_TITLE')}
      </span>
      <div className={classNames['feedback-form__text-box']}>
        <TextArea
          aria-describedby={disclaimer ? disclaimerId : undefined}
          aria-labelledby={feedbackFormHeaderId}
          className={classNames['feedback-form__text-area']}
          data-testid={testIds.feedbackSendBox}
          onInput={handleMessageChange}
          placeholder={localize('FEEDBACK_FORM_PLACEHOLDER')}
          ref={feedbackTextAreaRef}
          startRows={3}
          value={userFeedback}
        />
      </div>
      {disclaimer && (
        <Markdownable className={classNames['feedback-form__form-footer']} id={disclaimerId} text={disclaimer} />
      )}
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
