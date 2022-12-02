import React from 'react';
import { hooks } from 'botframework-webchat-component';

const { useSendMessage } = hooks;

const HelloButton = () => {
  const sendMessage = useSendMessage();

  return <button onClick={() => sendMessage('Hello!')}>Say Hello!</button>;
};

export default HelloButton;
