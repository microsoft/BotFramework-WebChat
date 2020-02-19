import PropTypes from 'prop-types';
import { useEffect } from 'react';

import { speechSynthesis } from './Speech/BypassSpeechSynthesisPonyfill';

import useDebugDeps from './hooks/internal/useDebugDeps';
import useTrackEvent from './hooks/useTrackEvent';
import useWebSpeechPonyfill from './hooks/useWebSpeechPonyfill';

const Tracker = () => {
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

  useEffect(() => {
    trackEvent('capability.speechRecognition', { type: speechRecognitionCapability });
  }, [trackEvent, speechRecognitionCapability]);

  useEffect(() => {
    trackEvent('capability.speechSynthesis', { type: speechSynthesisCapability });
  }, [trackEvent, speechSynthesisCapability]);

  useDebugDeps(
    {
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
