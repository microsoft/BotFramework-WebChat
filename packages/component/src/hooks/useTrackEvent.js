import { useCallback } from 'react';

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

  return useCallback(
    (name, data) => {
      if (!name || typeof name !== 'string') {
        return console.warn('botframework-webchat: "name" passed to "useTrackEvent" hook must be a string.');
      }

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

      const event = new Event('event');

      event.data = data;
      event.dimensions = readTelemetryDimensions();
      event.name = name;

      onTelemetry && onTelemetry(event);
    },
    [onTelemetry]
  );
}
