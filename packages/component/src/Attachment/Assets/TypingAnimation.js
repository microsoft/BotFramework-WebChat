import React from 'react';

import connectToWebChat from '../../connectToWebChat';

const ConnectTypingAnimation = connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(({ styleSet }) =>
  <div className={ styleSet.typingAnimation } />
)

export default () => <ConnectTypingAnimation />
