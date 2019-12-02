import './MicrophoneButton.css';

import { hooks } from 'botframework-webchat';
import classNames from 'classnames';
// import React from 'react';
import React, { useCallback, useEffect } from 'react';

const { useMicrophoneButtonClick, useMicrophoneButtonDisabled, useSendBoxDictationStarted } = hooks;
const { useSendMessage } = hooks;

const CustomMicrophoneButton = ({ onClick }) => {
  const [dictating] = useSendBoxDictationStarted();
  const [disabled] = useMicrophoneButtonDisabled();
  const click = useMicrophoneButtonClick();
  const sendMessage = useSendMessage();

  const handleClick = useCallback(() => {
    click();
    onClick && onClick();
  }, [click, onClick]);

  useEffect(() => {
    // setTimeout(() => sendMessage('carousel'), 1000);
    setTimeout(() => sendMessage('card breakfast weather bingsports'), 1000);
    // setTimeout(() => sendMessage('thumbnailcard'), 1000);
  }, [sendMessage]);

  return (
    <button className={classNames('App-MicrophoneButton', { dictating })} disabled={disabled} onClick={handleClick}>
      <i className="ms-Icon ms-Icon--Microphone" />
    </button>
  );
};

export default CustomMicrophoneButton;
