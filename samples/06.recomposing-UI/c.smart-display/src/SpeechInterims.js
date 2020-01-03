import './SpeechInterims.css';

import { hooks } from 'botframework-webchat';
import React from 'react';

const { useDictateInterims, useSendBoxSpeechInterimsVisible } = hooks;

const CustomDictationInterims = () => {
  const [dictateInterims] = useDictateInterims();
  const [speechInterimsVisible] = useSendBoxSpeechInterimsVisible();

  return (
    speechInterimsVisible && (
      <div className="App-SpeechInterims">
        {!!speechInterimsVisible && dictateInterims.map((interim, index) => <span key={index}>{interim}&nbsp;</span>)}
      </div>
    )
  );
};

export default CustomDictationInterims;
