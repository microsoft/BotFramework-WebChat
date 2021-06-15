import { useCallback, useMemo } from 'react';

import createCustomEvent from '../utils/createCustomEvent';
import isObject from '../utils/isObject';
import useReadTelemetryDimensions from './internal/useReadTelemetryDimensions';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

function isNonNegativeFiniteNumberOrString(value) {
  return (typeof value === 'number' && isFinite(value) && value >= 0) || typeof value === 'string';
}

type TrackEventFunction = {
  (name: string, data: any): void;
  debug: (name: string, data: any) => void;
  error: (name: string, data: any) => void;
  info: (name: string, data: any) => void;
  warn: (name: string, data: any) => void;
};

export default function useTrackEvent(): TrackEventFunction {
  const { onTelemetry } = useWebChatAPIContext();
  const readTelemetryDimensions = useReadTelemetryDimensions();

  const trackEvent = useCallback(
    (level, name, data) => {
      if (!name || typeof name !== 'string') {
        return console.warn('botframework-webchat: "name" passed to "useTrackEvent" hook must be a string.');
      }

      if (typeof data !== 'undefined') {
        if (isObject(data)) {
          if (!Object.values(data).every(value => isNonNegativeFiniteNumberOrString(value))) {
            return console.warn(
              'botframework-webchat: Every value in "data" map passed to "useTrackEvent" hook must be a non-negative finite number or string.'
            );
          }
        } else if (!isNonNegativeFiniteNumberOrString(data)) {
          return console.warn(
            'botframework-webchat: "data" passed to "useTrackEvent" hook must be a non-negative finite number or string.'
          );
        }
      }

      onTelemetry &&
        onTelemetry(createCustomEvent('event', { data, dimensions: readTelemetryDimensions(), level, name }));
    },
    [onTelemetry, readTelemetryDimensions]
  );

  return useMemo(() => {
    const info: TrackEventFunction = trackEvent.bind(null, 'info');

    info.debug = trackEvent.bind(null, 'debug');
    info.error = trackEvent.bind(null, 'error');
    info.info = info;
    info.warn = trackEvent.bind(null, 'warn');

    return info;
  }, [trackEvent]);
}
