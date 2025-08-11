import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo, useCallback, useMemo, type FormEventHandler, type KeyboardEventHandler } from 'react';
import { Extract, wrapWith } from 'react-wrap-with';
import { useRefFrom } from 'use-ref-from';

import FeedbackForm from './private/FeedbackForm';
import FeedbackVoteButtonBar from './private/FeedbackVoteButtonBar';
import isActionRequireReview from './private/isActionRequireReview';
import ActivityFeedbackComposer from './providers/ActivityFeedbackComposer';
import useActivityFeedbackHooks from './providers/useActivityFeedbackHooks';

import styles from './private/FeedbackForm.module.css';

function InternalActivityFeedback() {
  const classNames = useStyles(styles);

  const { useActions, useFeedbackText, useFocusFeedbackButton, useHasSubmitted, useSelectedAction, useSubmit } =
    useActivityFeedbackHooks();

  const [_, setFeedbackText] = useFeedbackText();
  const [actions] = useActions();
  const [hasSubmitted] = useHasSubmitted();
  const [selectedAction, setSelectedAction] = useSelectedAction();
  const focusFeedbackButton = useFocusFeedbackButton();
  const submit = useSubmit();

  const firstActionRequireReview = useMemo(() => actions.find(isActionRequireReview), [actions]);
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
      // ESCAPE key should clear the feedback form and unselect like/dislike as they are radio button.
      // In non-form mode, the like/dislike are actions, so they should not be unselected.
      if (event.key === 'Escape' && isActionRequireReview(selectedActionRef.current)) {
        event.stopPropagation();
        event.currentTarget.reset();
      }
    },
    [selectedActionRef]
  );

  // Hide feedback form if feedback has already been submitted or it does not require UserReview.
  const isExpanded = useMemo(
    () => !hasSubmitted && selectedAction?.result?.['@type'] === 'UserReview',
    [hasSubmitted, selectedAction]
  );

  return (
    !!actions.length && (
      <form
        className={classNames['feedback-form']}
        onKeyDown={handleKeyDown}
        onReset={handleReset}
        onSubmit={handleSubmit}
      >
        <FeedbackVoteButtonBar
          // If one of the action requires review, use radio button for all.
          buttonAs={firstActionRequireReview ? 'radio' : 'button'}
        />
        {/* We put the form outside of the container to let it wrap to next line instead of keeping it the same line as the like/dislike buttons. */}
        {isExpanded && <FeedbackForm />}
      </form>
    )
  );
}

const ActivityFeedback = wrapWith(ActivityFeedbackComposer, { activity: Extract })(InternalActivityFeedback);

ActivityFeedback.displayName = 'ActivityFeedback';

export default memo(ActivityFeedback);
