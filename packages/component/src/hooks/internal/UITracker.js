import { hooks } from 'botframework-webchat-api';
import { useEffect } from 'react';

import { checkSupport as supportWorker } from '../../Utils/downscaleImageToDataURL/downscaleImageToDataURLUsingWorker';
import { speechSynthesis } from './BypassSpeechSynthesisPonyfill';
import useWebSpeechPonyfill from '../useWebSpeechPonyfill';

const { useTrackDimension } = hooks;

const Tracker = () => {
  const [webSpeechPonyfill] = useWebSpeechPonyfill();
  const trackDimension = useTrackDimension();

  const speechRecognitionCapability = !!webSpeechPonyfill.SpeechRecognition;
  const speechSynthesisCapability =
    webSpeechPonyfill.speechSynthesis && webSpeechPonyfill.speechSynthesis !== speechSynthesis;

  useEffect(() => {
    trackDimension('capability:downscaleImage:workerType', supportWorker() ? 'web worker' : 'main');
    trackDimension('capability:renderer', 'html');

    // TODO: [P2] #2937 Differentiate between Cognitive Services and browser speech
    trackDimension('prop:speechRecognition', !!speechRecognitionCapability + '');
    trackDimension('prop:speechSynthesis', !!speechSynthesisCapability + '');
  }, [trackDimension, speechRecognitionCapability, speechSynthesisCapability]);

  return false;
};

export default Tracker;
