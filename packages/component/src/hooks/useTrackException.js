import { useCallback } from 'react';

import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useTrackException() {
  const { onTelemetry } = useWebChatUIContext();

  return useCallback(error => {
    if (!(error instanceof Error)) {
      return console.warn(
        `botframework-webchat: useTrackException can only track exception of type Error, ignoring exception.`
      );
    }

    onTelemetry && onTelemetry('exception', error);
  }, []);
}
