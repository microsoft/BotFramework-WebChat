import './MicrophoneButton.css';

import { hooks } from 'botframework-webchat';
import classNames from 'classnames';
import React, { useCallback } from 'react';

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

  return (
    <button className={classNames('App-MicrophoneButton', { dictating })} disabled={disabled} onClick={handleClick}>
      <i className="ms-Icon ms-Icon--Microphone" />
    </button>
  );
};

export default CustomMicrophoneButton;
