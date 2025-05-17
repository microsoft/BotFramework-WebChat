import classNames from 'classnames';
import React, { memo, useCallback, type FormEventHandler, type KeyboardEventHandler } from 'react';
import { Extract, wrapWith } from 'react-wrap-with';
import { useRefFrom } from 'use-ref-from';

import useStyleSet from '../hooks/useStyleSet';
import FeedbackLoopWithMessage from './private/FeedbackLoopWithMessage';
import FeedbackLoopWithoutMessage from './private/FeedbackLoopWithoutMessage';
import ActivityFeedbackComposer from './providers/ActivityFeedbackComposer';
import useFeedbackText from './providers/useFeedbackText';
import useFocusAction from './providers/useFocusAction';
import useSelectedAction from './providers/useSelectedAction';
import useShouldShowFeedbackForm from './providers/useShouldShowFeedbackForm';
import useSubmitCallback from './providers/useSubmitCallback';

function InternalActivityFeedback() {
  const [{ feedbackForm }] = useStyleSet();
  const [feedbackText, setFeedbackText] = useFeedbackText();
  const [selectedAction, setSelectedAction] = useSelectedAction();
  const [shouldShowFeedbackForm] = useShouldShowFeedbackForm();
  const focusAction = useFocusAction();
  const submit = useSubmitCallback();

  const feedbackTextRef = useRefFrom(feedbackText);
  const selectedActionRef = useRefFrom(selectedAction);

  const handleReset = useCallback<FormEventHandler<HTMLFormElement>>(() => {
    focusAction(selectedActionRef.current);

    setFeedbackText(undefined);
    setSelectedAction(undefined);
  }, [focusAction, selectedActionRef, setFeedbackText, setSelectedAction]);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    event => {
      event.preventDefault();

      submit(selectedActionRef.current, feedbackTextRef.current);
    },
    [feedbackTextRef, selectedActionRef, submit]
  );

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLFormElement>>(
    event => {
      if (event.key === 'Escape' && selectedActionRef.current) {
        event.stopPropagation();
        event.currentTarget.reset();
      }
    },
    [selectedActionRef]
  );

  return (
    <form
      className={classNames('webchat__feedback-form-real', feedbackForm + '')}
      onKeyDown={handleKeyDown}
      onReset={handleReset}
      onSubmit={handleSubmit}
    >
      {shouldShowFeedbackForm ? <FeedbackLoopWithMessage /> : <FeedbackLoopWithoutMessage />}
    </form>
  );
}

const ActivityFeedback = wrapWith(ActivityFeedbackComposer, { activity: Extract })(InternalActivityFeedback);

ActivityFeedback.displayName = 'ActivityFeedback';

export default memo(ActivityFeedback);
