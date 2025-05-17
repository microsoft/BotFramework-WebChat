import React, { Fragment, memo, useMemo } from 'react';

import useActivityFeedbackHooks from '../providers/useActivityFeedbackHooks';
import FeedbackForm from './FeedbackForm';
import FeedbackVoteButtonBar from './FeedbackVoteButtonBar';

function FeedbackLoopWithMessage() {
  const { useHasSubmitted, useSelectedActions } = useActivityFeedbackHooks();

  const [hasSubmitted] = useHasSubmitted();
  const [selectedAction] = useSelectedActions();

  // Hide feedback form if feedback has already been submitted
  const isExpanded = useMemo(() => !hasSubmitted && !!selectedAction, [hasSubmitted, selectedAction]);

  return (
    <Fragment>
      <FeedbackVoteButtonBar />
      {/* We put the form outside of the container to let it wrap to next line instead of keeping it the same line as the like/dislike buttons. */}
      {isExpanded && <FeedbackForm />}
    </Fragment>
  );
}

export default memo(FeedbackLoopWithMessage);
