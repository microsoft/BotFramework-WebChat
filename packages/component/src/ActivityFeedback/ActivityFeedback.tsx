import classNames from 'classnames';
import React, { memo, useCallback, type FormEventHandler, type KeyboardEventHandler } from 'react';
import { Extract, wrapWith } from 'react-wrap-with';
import { useRefFrom } from 'use-ref-from';

import useStyleSet from '../hooks/useStyleSet';
import FeedbackLoopWithMessage from './private/FeedbackLoopWithMessage';
import FeedbackLoopWithoutMessage from './private/FeedbackLoopWithoutMessage';
import ActivityFeedbackComposer from './providers/ActivityFeedbackComposer';
import useActivityFeedbackHooks from './providers/useActivityFeedbackHooks';

function InternalActivityFeedback() {
  const { useFeedbackText, useFocusFeedbackButton, useSelectedActions, useShouldShowFeedbackForm, useSubmit } =
    useActivityFeedbackHooks();

  const [{ feedbackForm }] = useStyleSet();
  const [_, setFeedbackText] = useFeedbackText();
  const [selectedAction, setSelectedAction] = useSelectedActions();
  const [shouldShowFeedbackForm] = useShouldShowFeedbackForm();
  const focusFeedbackButton = useFocusFeedbackButton();
  const submit = useSubmit();

  const selectedActionRef = useRefFrom(selectedAction);

  const handleReset = useCallback<FormEventHandler<HTMLFormElement>>(() => {
    focusFeedbackButton(selectedActionRef.current);

    setFeedbackText(undefined);
    setSelectedAction(undefined);
  }, [focusFeedbackButton, selectedActionRef, setFeedbackText, setSelectedAction]);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    event => {
      event.preventDefault();

      submit(selectedActionRef.current);
    },
    [selectedActionRef, submit]
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
      className={classNames('webchat__feedback-form', feedbackForm + '')}
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
