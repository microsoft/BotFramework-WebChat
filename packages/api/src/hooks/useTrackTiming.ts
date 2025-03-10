import { useCallback } from 'react';

import createCustomEvent from '../utils/createCustomEvent';
import randomId from '../utils/randomId';
import useReadTelemetryDimensions from './internal/useReadTelemetryDimensions';
import useWebChatAPIContext from './internal/useWebChatAPIContext';
import usePonyfill from './usePonyfill';
import useTrackException from './useTrackException';

export default function useTrackTiming<T>(): (name: string, functionOrPromise: (() => T) | Promise<T>) => Promise<T> {
  const [{ Date }] = usePonyfill();
  const { onTelemetry } = useWebChatAPIContext();
  const readTelemetryDimensions = useReadTelemetryDimensions();
  const trackException = useTrackException();

  return useCallback(
    async (name, functionOrPromise): Promise<T> => {
      if (!name || typeof name !== 'string') {
        console.warn(
          'botframework-webchat: "name" passed to "useTrackTiming" hook must be specified and of type string.'
        );

        return;
      } else if (typeof functionOrPromise !== 'function' && typeof functionOrPromise.then !== 'function') {
        console.warn(
          'botframework-webchat: "functionOrPromise" passed to "useTrackTiming" hook must be specified, of type function or Promise.'
        );

        return;
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
