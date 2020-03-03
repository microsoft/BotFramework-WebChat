import { useCallback } from 'react';

import createCustomEvent from '../Utils/createCustomEvent';
import useReadTelemetryDimensions from './internal/useReadTelemetryDimensions';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useTrackException() {
  const { onTelemetry } = useWebChatUIContext();
  const readTelemetryDimensions = useReadTelemetryDimensions();

  return useCallback(
    (error, fatal = true) => {
      if (!(error instanceof Error)) {
        return console.warn(
          'botframework-webchat: "error" passed to "useTrackException" must be specified and of type Error.'
        );
      }

      onTelemetry &&
        onTelemetry(
          createCustomEvent('exception', {
            dimensions: { ...readTelemetryDimensions() },
            error,
            fatal: !!fatal
          })
        );
    },
    [onTelemetry, readTelemetryDimensions]
  );
}
