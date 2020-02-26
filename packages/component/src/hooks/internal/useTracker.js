import { useEffect } from 'react';

import { checkSupport as supportWorker } from '../../Utils/downscaleImageToDataURLUsingWorker';
import { speechSynthesis } from '../../Speech/BypassSpeechSynthesisPonyfill';
import useLanguage from '../useLanguage';
import useTrackDimension from '../useTrackDimension';
import useTrackEvent from '../useTrackEvent';
import useWebSpeechPonyfill from '../useWebSpeechPonyfill';

function useTracker() {
  const [language] = useLanguage();
  const [webSpeechPonyfill] = useWebSpeechPonyfill();
  const trackDimension = useTrackDimension();
  const trackEvent = useTrackEvent();

  // TODO: [P2] #2937 Track how many of them customized the following:
  // - activityMiddleware
  // - activityStatusMiddleware
  // - attachmentMiddleware
  // - cardActionMiddleware
  // - toastMiddleware
  // - styleOptions

  const speechRecognitionCapability = !!webSpeechPonyfill.SpeechRecognition;
  const speechSynthesisCapability =
    webSpeechPonyfill.speechSynthesis && webSpeechPonyfill.speechSynthesis !== speechSynthesis;

  useEffect(() => {
    trackDimension('prop:locale', language);
  }, [language, trackDimension]);

  useEffect(() => {
    // TODO: [P2] #2937 Differentiate between Cognitive Services and browser speech
    trackDimension('prop:speechRecognition', !!speechRecognitionCapability + '');
  }, [trackDimension, speechRecognitionCapability]);

  useEffect(() => {
    // TODO: [P2] #2937 Differentiate between Cognitive Services and browser speech
    trackDimension('prop:speechSynthesis', !!speechSynthesisCapability + '');
  }, [trackDimension, speechSynthesisCapability]);

  useEffect(() => {
    trackDimension('capability:downscaleImage:workerType', supportWorker() ? 'web worker' : 'main');
  }, [trackDimension]);

  useEffect(() => {
    trackEvent('init');
  }, [trackEvent]);
}

export default useTracker;
