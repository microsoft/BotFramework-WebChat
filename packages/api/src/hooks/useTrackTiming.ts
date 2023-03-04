import { useCallback } from 'react';

import createCustomEvent from '../utils/createCustomEvent';
import randomId from '../utils/randomId';
import usePonyfill from './usePonyfill';
import useReadTelemetryDimensions from './internal/useReadTelemetryDimensions';
import useTrackException from './useTrackException';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useTrackTiming<T>(): (
  name: string,
  functionOrPromise: (() => T) | Promise<T>
) => Promise<T | void> {
  const [{ Date }] = usePonyfill();
  const { onTelemetry } = useWebChatAPIContext();
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
    [Date, onTelemetry, readTelemetryDimensions, trackException]
  );
}
