import React from 'react';

import connectToWebChat from '../../connectToWebChat';

const ConnectSpinnerAnimation = connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(({ styleSet }) =>
  <div className={ styleSet.spinnerAnimation } />
)

export default () => <ConnectSpinnerAnimation />
