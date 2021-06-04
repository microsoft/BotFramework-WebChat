import { useCallback } from 'react';

import createCustomEvent from '../utils/createCustomEvent';
import useReadTelemetryDimensions from './internal/useReadTelemetryDimensions';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useTrackException(): (error: Error, fatal: boolean) => void {
  const { onTelemetry } = useWebChatAPIContext();
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
