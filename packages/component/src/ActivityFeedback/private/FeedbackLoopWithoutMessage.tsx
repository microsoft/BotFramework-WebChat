import React, { memo } from 'react';
import FeedbackVoteButtonBar from './FeedbackVoteButtonBar';

function FeedbackLoopWithoutMessage() {
  return <FeedbackVoteButtonBar />;
}

export default memo(FeedbackLoopWithoutMessage);
