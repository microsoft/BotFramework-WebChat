import React from 'react';

import connectWithContext from '../connectWithContext';
import TypingAnimation from './Assets/TypingAnimation';

export default connectWithContext(
  ({ styleSet }) => ({ styleSet })
)(({ styleSet }) =>
  <div className={ styleSet.typingActivity }>
    <TypingAnimation />
  </div>
)
