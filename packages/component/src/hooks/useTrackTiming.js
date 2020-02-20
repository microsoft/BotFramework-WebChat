import { useCallback } from 'react';

import useReadTelemetryDimensions from './useReadTelemetryDimensions';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useTrackTiming() {
  const { onTelemetry } = useWebChatUIContext();
  const readTelemetryDimensions = useReadTelemetryDimensions();

  return useCallback(
    async (name, functionOrPromise) => {
      if (!name || typeof name !== 'string') {
        return console.warn(
          'botframework-webchat: "name" passed to "useTrackTiming" hook must be specified and of type string. Ignoring.'
        );
      } else if (typeof functionOrPromise !== 'function' && typeof functionOrPromise.then !== 'function') {
        return console.warn(
          'botframework-webchat: "functionOrPromise" passed to "useTrackTiming" hook must be specified, of type function or Promise. Ignoring.'
        );
      }

      const startTime = Date.now();
      const timingStartEvent = new Event('timingstart');

      timingStartEvent.dimensions = readTelemetryDimensions();
      timingStartEvent.name = name;
      onTelemetry && onTelemetry(timingStartEvent);

      const result = await (typeof functionOrPromise === 'function' ? functionOrPromise() : functionOrPromise);

      const timingEndEvent = new Event('timingend');

      timingEndEvent.dimensions = readTelemetryDimensions();
      timingEndEvent.duration = Date.now() - startTime;
      timingEndEvent.name = name;

      onTelemetry && onTelemetry(timingEndEvent);

      return result;
    },
    [onTelemetry]
  );
}
