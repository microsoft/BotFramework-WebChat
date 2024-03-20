/* eslint no-magic-numbers: ["error", { "ignore": [0, 1024] }] */

import { useCallback } from 'react';

import useTrackEvent from './useTrackEvent';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

type PostActivityFile = {
  name: string;
  size: number;
  thumbnail?: string;
  url: string;
};

export default function useSendFiles(): (files: PostActivityFile[], text?: string) => void {
  const { sendFiles } = useWebChatAPIContext();
  const trackEvent = useTrackEvent();

  return useCallback(
    (files, text) => {
      if (files && files.length) {
        sendFiles(files, text);

        trackEvent('sendFiles', {
          numFiles: files.length,
          sumSizeInKB: Math.round(files.reduce((total, { size }) => total + size, 0) / 1024)
        });
      }
    },
    [sendFiles, trackEvent]
  );
}
