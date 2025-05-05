import classNames from 'classnames';
import React, { memo, useMemo } from 'react';

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
    <div className={classNames('webchat__feedback-form__root-container', feedbackForm + '')}>
      <div className={classNames('webchat__feedback-form__root-child')}>
        <FeedbackVoteButtonBar />
      </div>
      {isExpanded && <FeedbackForm />}
    </div>
  );
}

export default memo(FeedbackLoopWithMessage);
