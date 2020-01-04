import React, { useCallback, useState } from 'react';

import BlurLens from './BlurLens';
import BotResponse from './BotResponse';
import Clock from './Clock';
import MicrophoneButton from './MicrophoneButton';
import SpeechInterims from './SpeechInterims';

import useLastBotActivity from './hooks/useLastBotActivity';

const SmartDisplay = () => {
  const [lastBotActivity] = useLastBotActivity();
  const [lastReadActivityID, setLastReadActivityID] = useState();

  const handleMicrophoneButtonClick = useCallback(() => {
    lastBotActivity && setLastReadActivityID(lastBotActivity.id);
  }, [lastBotActivity, setLastReadActivityID]);

  return (
    <div className="App-SmartDisplay">
      <Clock />
      <BlurLens />
      <SpeechInterims />
      <BotResponse lastReadActivityID={lastReadActivityID} />
      <MicrophoneButton onClick={handleMicrophoneButtonClick} />
    </div>
  );
};

export default SmartDisplay;
