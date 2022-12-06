import React from 'react';
import { Components } from 'botframework-webchat-component';
import HelloButton from './HelloButton';

const CustomWebChat = () => {
  return (
    <Components.AccessKeySinkSurface>
      <Components.BasicToaster />
      <Components.BasicTranscript />
      <Components.BasicConnectivityStatus />
      <HelloButton />
      <Components.BasicSendBox />
    </Components.AccessKeySinkSurface>
  );
};

export default CustomWebChat;
