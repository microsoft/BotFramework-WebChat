import { useCallback } from 'react';

import useWebChatAPIContext from './useWebChatAPIContext';

export default function useReadTelemetryDimensions() {
  const { telemetryDimensionsRef } = useWebChatAPIContext();

  return useCallback(() => ({ ...telemetryDimensionsRef.current }), [telemetryDimensionsRef]);
}
