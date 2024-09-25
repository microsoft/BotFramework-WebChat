import { Components } from 'botframework-webchat';
import React, { memo } from 'react';
import HelloButton from './HelloButton';

function CustomWebChat() {
  return (
    <Components.AccessKeySinkSurface>
      <Components.BasicToaster />
      <Components.BasicTranscript />
      <Components.BasicConnectivityStatus />
      <HelloButton />
      <Components.BasicSendBox />
    </Components.AccessKeySinkSurface>
  );
}

export default memo(CustomWebChat);
