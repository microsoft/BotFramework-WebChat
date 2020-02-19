import { useCallback } from 'react';

import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useTrackTiming() {
  const { onTelemetry } = useWebChatUIContext();

  return useCallback(
    async (name, functionOrPromise) => {
      if (!name || typeof name !== 'string') {
        return console.warn('botframework-webchat: "name" passed to "useTrackEvent" hook must be a string.');
      }

      const startTime = Date.now();
      const result = await (typeof functionOrPromise === 'function' ? functionOrPromise() : functionOrPromise);
      const processingTime = Date.now() - startTime;

      onTelemetry && onTelemetry('timing', name, processingTime);

      return result;
    },
    [onTelemetry]
  );
}
