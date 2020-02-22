import { useEffect } from 'react';

import { checkSupport as supportWorker } from './Utils/downscaleImageToDataURLUsingWorker';
import { speechSynthesis } from './Speech/BypassSpeechSynthesisPonyfill';
import useDebugDeps from './hooks/internal/useDebugDeps';
import useLanguage from './hooks/useLanguage';
import useTrackDimension from './hooks/useTrackDimension';
import useTrackEvent from './hooks/useTrackEvent';
import useWebSpeechPonyfill from './hooks/useWebSpeechPonyfill';

const Tracker = () => {
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

  useDebugDeps(
    {
      language,
      speechRecognitionCapability,
      speechSynthesisCapability,
      webSpeechPonyfill
    },
    '<Tracker>'
  );

  return false;
};

export default Tracker;
