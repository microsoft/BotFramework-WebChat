import { useCallback } from 'react';

import createCustomEvent from '../Utils/createCustomEvent';
import randomId from '../Utils/randomId';
import useReadTelemetryDimensions from './internal/useReadTelemetryDimensions';
import useTrackException from './useTrackException';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useTrackTiming() {
  const { onTelemetry } = useWebChatUIContext();
  const readTelemetryDimensions = useReadTelemetryDimensions();
  const trackException = useTrackException();

  return useCallback(
    async (name, functionOrPromise) => {
      if (!name || typeof name !== 'string') {
        return console.warn(
          'botframework-webchat: "name" passed to "useTrackTiming" hook must be specified and of type string.'
        );
      } else if (typeof functionOrPromise !== 'function' && typeof functionOrPromise.then !== 'function') {
        return console.warn(
          'botframework-webchat: "functionOrPromise" passed to "useTrackTiming" hook must be specified, of type function or Promise.'
        );
      }

      const timingId = randomId();

      onTelemetry &&
        onTelemetry(
          createCustomEvent('timingstart', {
            dimensions: readTelemetryDimensions(),
            name,
            timingId
          })
        );

      const startTime = Date.now();

      try {
        return await (typeof functionOrPromise === 'function' ? functionOrPromise() : functionOrPromise);
      } catch (err) {
        trackException(err, false);

        throw err;
      } finally {
        const duration = Date.now() - startTime;

        onTelemetry &&
          onTelemetry(
            createCustomEvent('timingend', {
              dimensions: readTelemetryDimensions(),
              duration,
              name,
              timingId
            })
          );
      }
    },
    [onTelemetry, readTelemetryDimensions, trackException]
  );
}
