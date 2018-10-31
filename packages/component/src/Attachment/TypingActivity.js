import React from 'react';

import connectToWebChat from '../connectToWebChat';
import TypingAnimation from './Assets/TypingAnimation';

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(({ styleSet }) =>
  <div className={ styleSet.typingActivity }>
    <TypingAnimation />
  </div>
)
