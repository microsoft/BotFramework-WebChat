import { useCallback } from 'react';

import useReadTelemetryDimensions from './internal/useReadTelemetryDimensions';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useTrackException() {
  const { onTelemetry } = useWebChatUIContext();
  const readTelemetryDimensions = useReadTelemetryDimensions();

  return useCallback(
    error => {
      if (!(error instanceof Error)) {
        return console.warn(
          'botframework-webchat: "error" passed to "useTrackException" must be specified and of type Error. Ignoring.'
        );
      }

      const event = new Event('exception');

      event.dimensions = { ...readTelemetryDimensions() };
      event.error = error;

      onTelemetry && onTelemetry(event);
    },
    [onTelemetry]
  );
}
