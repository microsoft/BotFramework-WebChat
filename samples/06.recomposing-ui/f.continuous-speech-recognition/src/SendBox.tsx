import React from 'react';
import { Components, hooks, Constants } from 'botframework-webchat';
import MicrophoneButton from './MicrophoneButton';
import './SendBox.css';

type SendBoxProps = {
  readonly changeView: (view: string) => void;
};

const { useDictateState } = hooks;

const {
  DictateState: { DICTATING, STARTING }
} = Constants;

const { SuggestedActions, DictationInterims, SendTextBox: TextBox } = Components;

function useSendBoxSpeechInterimsVisible(): [boolean] {
  const [dictateState] = useDictateState();

  return [dictateState === STARTING || dictateState === DICTATING];
}

const SendBox = ({ changeView }: SendBoxProps) => {
  const [speechInterimsVisible] = useSendBoxSpeechInterimsVisible();

  return (
    <div>
      <SuggestedActions />
      <div className="App-send_box_container">
        {speechInterimsVisible ? (
          <DictationInterims className="App-max_width" />
        ) : (
          <TextBox className="App-max_width" />
        )}
        <MicrophoneButton changeView={changeView} />
      </div>
    </div>
  );
};

SendBox.displayName = 'SendBox';

export default SendBox;
