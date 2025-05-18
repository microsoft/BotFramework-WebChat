import React, { memo } from 'react';
import FeedbackVoteButtonBar from './FeedbackVoteButtonBar';

function FeedbackLoopWithoutMessage() {
  return <FeedbackVoteButtonBar buttonAs="button" />;
}

export default memo(FeedbackLoopWithoutMessage);
