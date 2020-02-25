import { useCallback, useMemo } from 'react';

import useReadTelemetryDimensions from './internal/useReadTelemetryDimensions';
import useWebChatUIContext from './internal/useWebChatUIContext';

function isNonNegativeFiniteNumberOrString(value) {
  return (typeof value === 'number' && isFinite(value) && value >= 0) || typeof value === 'string';
}

function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export default function useTrackEvent() {
  const { onTelemetry } = useWebChatUIContext();
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

      const event = new Event('event');

      event.data = data;
      event.dimensions = readTelemetryDimensions();
      event.level = level;
      event.name = name;

      onTelemetry && onTelemetry(event);
    },
    [onTelemetry, readTelemetryDimensions]
  );

  return useMemo(() => {
    const info = trackEvent.bind(null, 'info');

    info.debug = trackEvent.bind(null, 'debug');
    info.error = trackEvent.bind(null, 'error');
    info.info = info;
    info.warn = trackEvent.bind(null, 'warn');

    return info;
  }, [trackEvent]);
}
