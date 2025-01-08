import './MicrophoneButton.css';

import { hooks } from 'botframework-webchat';
import classNames from 'classnames';
import React, { memo, useCallback } from 'react';

const { useMicrophoneButtonClick, useMicrophoneButtonDisabled, useSendBoxSpeechInterimsVisible } = hooks;

function CustomMicrophoneButton({ onClick }: Readonly<{ onClick: () => void }>) {
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
}

export default memo(CustomMicrophoneButton);
