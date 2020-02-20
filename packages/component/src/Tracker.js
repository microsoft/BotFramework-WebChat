import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef } from 'react';

import { checkSupport as supportWorker } from './Utils/downscaleImageToDataURLUsingWorker';
import { speechSynthesis } from './Speech/BypassSpeechSynthesisPonyfill';
import useDebugDeps from './hooks/internal/useDebugDeps';
import useLanguage from './hooks/useLanguage';
import useTrackDimension from './hooks/useTrackDimension';
import useTrackEvent from './hooks/useTrackEvent';
import useWebSpeechPonyfill from './hooks/useWebSpeechPonyfill';

function useEffectWithCounter(fn, deps) {
  const counterRef = useRef(0);
  const cachedFn = useCallback(fn, deps);

  useEffect(() => cachedFn(counterRef.current++), [cachedFn, ...deps]);
}

const Tracker = () => {
  const [language] = useLanguage();
  const [webSpeechPonyfill] = useWebSpeechPonyfill();
  const trackDimension = useTrackDimension();
  const trackEvent = useTrackEvent();

  // TODO: Track how many of them customized the following:
  // - activityMiddleware
  // - activityStatusMiddleware
  // - attachmentMiddleware
  // - cardActionMiddleware
  // - toastMiddleware
  // - styleOptions

  const speechRecognitionCapability = !!webSpeechPonyfill.SpeechRecognition;
  const speechSynthesisCapability =
    webSpeechPonyfill.speechSynthesis && webSpeechPonyfill.speechSynthesis !== speechSynthesis;

  // TODO: [TEST] We should not emit "prop:language" again if "onTelemetry" change.
  //       Once telemetry data is sent, it is gone.
  useEffectWithCounter(
    numChange => {
      trackDimension('prop:locale', language);
      trackDimension('prop:locale:numChange', numChange);
    },
    [language, trackDimension]
  );

  useEffect(() => {
    // TODO: Differentiate between Cognitive Services and browser speech
    trackDimension('capability:speechRecognition', !!speechRecognitionCapability + '');
  }, [trackDimension, speechRecognitionCapability]);

  useEffect(() => {
    // TODO: Differentiate between Cognitive Services and browser speech
    trackDimension('capability:speechSynthesis', !!speechSynthesisCapability + '');
  }, [trackDimension, speechSynthesisCapability]);

  useEffect(() => {
    trackDimension('capability:downscaleImage:webWorker', !!supportWorker() + '');
  }, [trackDimension]);

  useDebugDeps(
    {
      language,
      speechRecognitionCapability,
      speechSynthesisCapability,
      trackEvent,
      webSpeechPonyfill
    },
    '<Tracker>'
  );

  return false;
};

Tracker.propTypes = {
  onTelemetry: PropTypes.func.isRequired
};

export default Tracker;
