import classNames from 'classnames';
import React, { Fragment, memo, useMemo } from 'react';

import useStyleSet from '../../hooks/useStyleSet';
import useHasSubmitted from '../providers/useHasSubmitted';
import useSelectedAction from '../providers/useSelectedAction';
import FeedbackForm from './FeedbackForm';
import FeedbackVoteButtonBar from './FeedbackVoteButtonBar';

function FeedbackLoopWithMessage() {
  const [{ feedbackForm }] = useStyleSet();

  const [hasSubmitted] = useHasSubmitted();
  const [selectedAction] = useSelectedAction();

  // Hide feedback form if feedback has already been submitted
  const isExpanded = useMemo(() => !hasSubmitted && !!selectedAction, [hasSubmitted, selectedAction]);

  return (
    <Fragment>
      <div className={classNames('webchat__feedback-form-button-bar', feedbackForm + '')}>
        <FeedbackVoteButtonBar />
      </div>
      {/* We put the form outside of the container to let it wrap to next line instead of keeping it the same line as the like/dislike buttons. */}
      {isExpanded && <FeedbackForm />}
    </Fragment>
  );
}

export default memo(FeedbackLoopWithMessage);
