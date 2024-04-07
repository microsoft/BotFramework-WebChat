/* eslint no-magic-numbers: ["error", { "ignore": [0, 1024] }] */

import { warnOnce, type SendBoxAttachment } from 'botframework-webchat-core';
import { useCallback } from 'react';

import useWebChatAPIContext from './internal/useWebChatAPIContext';
import useTrackEvent from './useTrackEvent';

const warnDeprecation = warnOnce(
  'This hook will be removed on or after 2026-04-03. Please use `useSendMessage` instead.'
);

/**
 * @deprecated This hook will be removed on or after 2026-04-03. Please use `useSendMessage` instead.
 */
export default function useSendFiles(): (files: readonly SendBoxAttachment[]) => void {
  const { sendFiles } = useWebChatAPIContext();
  const trackEvent = useTrackEvent();

  return useCallback(
    files => {
      if (files && files.length) {
        warnDeprecation();
        sendFiles(
          files.map(({ blob, thumbnailURL }) => ({
            // Maintains backward compatible behavior by reading from `Blob.name` instead of `File.name`.
            name: (blob as { name?: string }).name,
            size: blob.size,
            url: URL.createObjectURL(blob),
            thumbnail: thumbnailURL?.toString()
          }))
        );

        trackEvent('sendFiles', {
          numFiles: files.length,
          sumSizeInKB: Math.round(files.reduce((total, { blob: { size } }) => total + size, 0) / 1024)
        });
      }
    },
    [sendFiles, trackEvent]
  );
}
