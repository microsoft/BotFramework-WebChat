import React, { memo } from 'react';

import useActions from '../providers/useActions';
import FeedbackVoteButton from './FeedbackVoteButton';

function FeedbackVoteButtonBar() {
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
