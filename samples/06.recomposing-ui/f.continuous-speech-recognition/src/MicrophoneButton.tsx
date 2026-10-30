import React, { useCallback } from 'react';
import classNames from 'classnames';
import { hooks, Constants } from 'botframework-webchat';
import Mic from './Assets/Mic';
import useUnSpokenActivities from './useUnSpokenActivities';

type MicroPhoneButtonProps = {
  readonly changeView: (view: string) => void;
};

const { useDictateState, useMicrophoneButtonClick, useShouldSpeakIncomingActivity } = hooks;

const { DictateState } = Constants;

const MicrophoneButton = ({ changeView }: MicroPhoneButtonProps) => {
  const [dictateState] = useDictateState();
  const unSpokenActivities = useUnSpokenActivities();
  const microphoneClick = useMicrophoneButtonClick();
  const [, setShouldSpeakIncomingActivity] = useShouldSpeakIncomingActivity();

  const handleMicrophoneButtonClick = useCallback(() => {
    changeView('speech');
    setShouldSpeakIncomingActivity(false);
    microphoneClick();
  }, [changeView, microphoneClick, setShouldSpeakIncomingActivity]);

  return (
    <button
      className={classNames('App-icon-button', {
        'App-icon-button_animation': dictateState === DictateState.DICTATING && !unSpokenActivities.length
      })}
      onClick={handleMicrophoneButtonClick}
      type="button"
    >
      <Mic />
    </button>
  );
};

export default MicrophoneButton;
