import './MicrophoneButton.css';

import { hooks } from 'botframework-webchat';
import classNames from 'classnames';
import React, { useCallback } from 'react';

const { useMicrophoneButtonClick, useMicrophoneButtonDisabled, useSendBoxSpeechInterimsVisible } = hooks;

const CustomMicrophoneButton = ({ onClick }) => {
  const [interimsVisible] = useSendBoxSpeechInterimsVisible();
  const [disabled] = useMicrophoneButtonDisabled();
  const click = useMicrophoneButtonClick();

  const handleClick = useCallback(() => {
    click();
    onClick && onClick();
  }, [click, onClick]);

  return (
    <button
      className={classNames('App-MicrophoneButton', { dictating: interimsVisible })}
      disabled={disabled}
      onClick={handleClick}
    >
      <i className="ms-Icon ms-Icon--Microphone" />
    </button>
  );
};

export default CustomMicrophoneButton;
