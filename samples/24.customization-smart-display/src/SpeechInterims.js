import './SpeechInterims.css';

import { hooks, Constants } from 'botframework-webchat';
import React from 'react';

const { useActivities, useDictateState, useDictateInterims } = hooks;

// TODO: [P1] Some of our hooks are not in master yet, we are copying the code here.
const {
  DictateState: { DICTATING, STARTING }
} = Constants;

// TODO: [P1] Some of our hooks are not in master yet, we are copying the code here.
function activityIsSpeakingOrQueuedToSpeak({ channelData: { speak } = {} }) {
  return !!speak;
}

// TODO: [P1] Some of our hooks are not in master yet, we are copying the code here.
function useSendBoxSpeechInterimsVisible() {
  const [activities] = useActivities();
  const [dictateState] = useDictateState();

  return [
    (dictateState === STARTING || dictateState === DICTATING) &&
      !activities.filter(activityIsSpeakingOrQueuedToSpeak).length
  ];
}

const CustomDictationInterims = () => {
  const [dictateInterims] = useDictateInterims();
  const [speechInterimsVisible] = useSendBoxSpeechInterimsVisible();
  // const dictateInterims = ['Hello, World! 1, 2, 3, 4, 5.'];
  // const speechInterimsVisible = true;

  return (
    speechInterimsVisible && (
      <div className="App-SpeechInterims">
        {!!speechInterimsVisible && dictateInterims.map((interim, index) => <span key={index}>{interim}&nbsp;</span>)}
      </div>
    )
  );
};

export default CustomDictationInterims;
