import { useCallback } from 'react';

import useReadTelemetryDimensions from './internal/useReadTelemetryDimensions';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useTrackEvent() {
  const { onTelemetry } = useWebChatUIContext();
  const readTelemetryDimensions = useReadTelemetryDimensions();

  return useCallback(
    (name, data, value) => {
      if (!name || typeof name !== 'string') {
        return console.warn('botframework-webchat: "name" passed to "useTrackEvent" hook must be a string. Ignoring.');
      } else if (typeof data !== 'string' && typeof data !== 'undefined') {
        return console.warn(
          'botframework-webchat: "data" passed to "useTrackEvent" hook must be a string or undefined. Ignoring.'
        );
      } else if ((typeof value !== 'number' || value < 0 || !isFinite(value)) && typeof value !== 'undefined') {
        return console.warn(
          'botframework-webchat: "value" passed to "useTrackEvent" hook must be a non-negative finite number or undefined. Ignoring.'
        );
      }

      const event = new Event('event');

      event.data = data;
      event.dimensions = readTelemetryDimensions();
      event.name = name;
      event.value = value;

      onTelemetry && onTelemetry(event);
    },
    [onTelemetry]
  );
}
