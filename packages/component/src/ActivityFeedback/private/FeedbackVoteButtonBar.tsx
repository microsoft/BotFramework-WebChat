import React, { memo } from 'react';

import useActivityFeedbackHooks from '../providers/useActivityFeedbackHooks';
import FeedbackVoteButton from './FeedbackVoteButton';

function FeedbackVoteButtonBar() {
  const { useActions } = useActivityFeedbackHooks();

  const [actions] = useActions();

  return (
    <div className="webchat__feedback-form__vote-button-bar">
      {actions.map((action, index) => (
        <FeedbackVoteButton action={action} key={action['@id'] || index} />
      ))}
    </div>
  );
}

export default memo(FeedbackVoteButtonBar);
