/* eslint no-magic-numbers: ["error", { "ignore": [0, 1024] }] */

import { useCallback } from 'react';

import useMarkAllAsAcknowledged from './useMarkAllAsAcknowledged';
import useTrackEvent from './useTrackEvent';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendFiles(): (files: File[]) => void {
  const { sendFiles } = useWebChatAPIContext();
  const markAllAsAcknowledged = useMarkAllAsAcknowledged();
  const trackEvent = useTrackEvent();

  return useCallback(
    files => {
      markAllAsAcknowledged();

      if (files && files.length) {
        sendFiles(files);

        trackEvent('sendFiles', {
          numFiles: files.length,
          sumSizeInKB: Math.round(files.reduce((total, { size }) => total + size, 0) / 1024)
        });
      }
    },
    [markAllAsAcknowledged, sendFiles, trackEvent]
  );
}
