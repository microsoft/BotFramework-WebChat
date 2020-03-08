import { useCallback } from 'react';

import useWebChatUIContext from './useWebChatUIContext';

export default function useReadTelemetryDimensions() {
  const { telemetryDimensionsRef } = useWebChatUIContext();

  return useCallback(() => ({ ...telemetryDimensionsRef.current }), [telemetryDimensionsRef]);
}
