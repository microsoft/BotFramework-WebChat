import { useCallback } from 'react';

import useReadTelemetryDimensions from './useReadTelemetryDimensions';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useTrackEvent() {
  const { onTelemetry } = useWebChatUIContext();
  const readTelemetryDimensions = useReadTelemetryDimensions();

  return useCallback(
    (name, data) => {
      if (!name || typeof name !== 'string') {
        return console.warn('botframework-webchat: "name" passed to "useTrackEvent" hook must be a string. Ignoring.');
      } else if (typeof data !== 'string' && typeof data !== 'undefined') {
        return console.warn(
          'botframework-webchat: "data" passed to "useTrackEvent" hook must be a string or undefined. Ignoring.'
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
