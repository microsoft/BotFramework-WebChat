import React from 'react';
import { Components } from 'botframework-webchat-component';
import HelloButton from './HelloButton';

const CustomWebChat = () => {
  return (
    <React.Fragment>
      <Components.BasicToaster />
      <Components.BasicTranscript />
      <Components.BasicConnectivityStatus />
      <HelloButton />
      <Components.BasicSendBox />
    </React.Fragment>
  );
};

export default CustomWebChat;
