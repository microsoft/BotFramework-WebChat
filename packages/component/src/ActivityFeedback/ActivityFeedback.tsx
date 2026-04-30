import { hooks } from 'botframework-webchat-api';
import type { OrgSchemaAction } from 'botframework-webchat-core';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, {
  memo,
  useCallback,
  useMemo,
  type Dispatch,
  type FormEventHandler,
  type KeyboardEventHandler,
  type SetStateAction
} from 'react';
import { Extract, wrapWith } from 'react-wrap-with';
import { useRefFrom } from 'use-ref-from';

import FeedbackForm from './private/FeedbackForm';
import FeedbackVoteButtonBar from './private/FeedbackVoteButtonBar';
import isActionRequireReview from './private/isActionRequireReview';
import ActivityFeedbackComposer from './providers/ActivityFeedbackComposer';
import useActivityFeedbackHooks from './providers/useActivityFeedbackHooks';

import styles from './private/FeedbackForm.module.css';

const { useStyleOptions } = hooks;

type FeedbackFormOverrideRenderer = (context: {
  selectedAction: OrgSchemaAction;
  onSubmit: () => void;
  onDismiss: () => void;
}) => React.ReactNode | null;

type FeedbackTextState = readonly [string | undefined, Dispatch<SetStateAction<string | undefined>>];
type SelectedActionState = readonly [OrgSchemaAction | undefined, (action: OrgSchemaAction | undefined) => void];
type StyleOptionsWithFeedbackFormOverrideComponent = Readonly<{
  renderFeedbackFormOverrideComponent?: FeedbackFormOverrideRenderer | undefined;
}>;

function InternalActivityFeedback() {
  const classNames = useStyles(styles);

  const { useActions, useFeedbackText, useFocusFeedbackButton, useHasSubmitted, useSelectedAction, useSubmit } =
    useActivityFeedbackHooks();

  const [_, setFeedbackText] = useFeedbackText() as FeedbackTextState;
  const [actions] = useActions();
  const [hasSubmitted] = useHasSubmitted();
  const [selectedAction, setSelectedAction] = useSelectedAction() as SelectedActionState;
  const focusFeedbackButton = useFocusFeedbackButton();
  const submit = useSubmit();
  const [{ renderFeedbackFormOverrideComponent }] = useStyleOptions() as readonly [
    StyleOptionsWithFeedbackFormOverrideComponent
  ];

  const firstActionRequireReview = useMemo(() => actions.find(isActionRequireReview), [actions]);
  const selectedActionRef = useRefFrom(selectedAction);

  const handleReset = useCallback<FormEventHandler<HTMLFormElement>>(() => {
    selectedActionRef.current && focusFeedbackButton(selectedActionRef.current);

    setFeedbackText(undefined);
    setSelectedAction(undefined);
  }, [focusFeedbackButton, selectedActionRef, setFeedbackText, setSelectedAction]);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    event => {
      event.preventDefault();

      selectedActionRef.current && submit(selectedActionRef.current);
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

  // Callbacks for custom feedback form renderer.
  const handleCustomSubmit = useCallback(() => {
    selectedActionRef.current && submit(selectedActionRef.current);
  }, [selectedActionRef, submit]);

  const handleCustomDismiss = useCallback(() => {
    selectedActionRef.current && focusFeedbackButton(selectedActionRef.current);

    setFeedbackText(undefined);
    setSelectedAction(undefined);
  }, [focusFeedbackButton, selectedActionRef, setFeedbackText, setSelectedAction]);

  const customFormElement = useMemo(() => {
    if (!renderFeedbackFormOverrideComponent || !isExpanded || !selectedAction) {
      return null;
    }

    return renderFeedbackFormOverrideComponent({
      selectedAction,
      onSubmit: handleCustomSubmit,
      onDismiss: handleCustomDismiss
    });
  }, [renderFeedbackFormOverrideComponent, isExpanded, selectedAction, handleCustomSubmit, handleCustomDismiss]);

  if (!actions.length) {
    return null;
  }

  return (
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
      {isExpanded && !renderFeedbackFormOverrideComponent && <FeedbackForm />}
      {/* When a host renderFeedbackFormOverrideComponent is provided, skip the native form. */}
      {isExpanded && renderFeedbackFormOverrideComponent ? customFormElement : null}
    </form>
  );
}

const ActivityFeedback = wrapWith(ActivityFeedbackComposer, { activity: Extract })(InternalActivityFeedback);

ActivityFeedback.displayName = 'ActivityFeedback';

export default memo(ActivityFeedback);
