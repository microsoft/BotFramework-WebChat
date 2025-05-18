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
  const {
    useActions,
    useFeedbackText,
    useFocusFeedbackButton,
    useSelectedActions,
    useShouldShowFeedbackForm,
    useSubmit
  } = useActivityFeedbackHooks();

  const [actions] = useActions();
  const [{ feedbackForm }] = useStyleSet();
  const [_, setFeedbackText] = useFeedbackText();
  const [selectedAction, setSelectedAction] = useSelectedActions();
  const [shouldShowFeedbackForm] = useShouldShowFeedbackForm();
  const focusFeedbackButton = useFocusFeedbackButton();
  const submit = useSubmit();

  const selectedActionRef = useRefFrom(selectedAction);
  const shouldShowFeedbackFormRef = useRefFrom(shouldShowFeedbackForm);

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
      // ESCAPE key should clear the feedback form and unselect like/dislike as they are radio button.
      // In non-form mode, the like/dislike are actions, so they should not be unselected.
      if (event.key === 'Escape' && selectedActionRef.current && shouldShowFeedbackFormRef.current) {
        event.stopPropagation();
        event.currentTarget.reset();
      }
    },
    [selectedActionRef, shouldShowFeedbackFormRef]
  );

  return (
    !!actions.length && (
      <form
        className={classNames('webchat__feedback-form', feedbackForm + '')}
        onKeyDown={handleKeyDown}
        onReset={handleReset}
        onSubmit={handleSubmit}
      >
        {shouldShowFeedbackForm ? <FeedbackLoopWithMessage /> : <FeedbackLoopWithoutMessage />}
      </form>
    )
  );
}

const ActivityFeedback = wrapWith(ActivityFeedbackComposer, { activity: Extract })(InternalActivityFeedback);

ActivityFeedback.displayName = 'ActivityFeedback';

export default memo(ActivityFeedback);
