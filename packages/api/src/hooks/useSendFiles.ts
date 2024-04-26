/* eslint no-magic-numbers: ["error", { "ignore": [0, 1024] }] */

import { warnOnce } from 'botframework-webchat-core';
import { useCallback } from 'react';

import useWebChatAPIContext from './internal/useWebChatAPIContext';
import useTrackEvent from './useTrackEvent';

const warnDeprecation = warnOnce(
  'This hook will be removed on or after 2026-04-03. Please use `useSendMessage` instead.'
);

export type PostActivityFile = {
  name: string;
  size: number;
  thumbnail?: string;
  url: string;
};

export default function useSendFiles(): (files: PostActivityFile[]) => void {
  const { sendFiles } = useWebChatAPIContext();
  const trackEvent = useTrackEvent();

  return useCallback(
    files => {
      if (files && files.length) {
        warnDeprecation();
        sendFiles(files);

        trackEvent('sendFiles', {
          numFiles: files.length,
          sumSizeInKB: Math.round(files.reduce((total, { size }) => total + size, 0) / 1024)
        });
      }
    },
    [sendFiles, trackEvent]
  );
}
