import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef } from 'react';

import { speechSynthesis } from './Speech/BypassSpeechSynthesisPonyfill';

import useDebugDeps from './hooks/internal/useDebugDeps';
import useLanguage from './hooks/useLanguage';
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

  useEffectWithCounter(
    numChange => {
      trackEvent('prop:language', { numChange, language });
    },
    [language, trackEvent]
  );

  useEffectWithCounter(
    numChange => {
      trackEvent('capability:speechRecognition', { numChange, type: speechRecognitionCapability });
    },
    [trackEvent, speechRecognitionCapability]
  );

  useEffectWithCounter(
    numChange => {
      trackEvent('capability:speechSynthesis', { numChange, type: speechSynthesisCapability });
    },
    [trackEvent, speechSynthesisCapability]
  );

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
