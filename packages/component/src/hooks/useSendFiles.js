/* eslint no-magic-numbers: ["error", { "ignore": [1024] }] */

import { useCallback } from 'react';

import downscaleImageToDataURL from '../Utils/downscaleImageToDataURL';
import useStyleOptions from '../hooks/useStyleOptions';
import useTrackEvent from '../hooks/useTrackEvent';
import useTrackTiming from '../hooks/useTrackTiming';
import useWebChatUIContext from './internal/useWebChatUIContext';

async function makeThumbnail(file, width, height, contentType, quality) {
  if (/\.(gif|jpe?g|png)$/iu.test(file.name)) {
    try {
      return await downscaleImageToDataURL(file, width, height, contentType, quality);
    } catch (error) {
      console.warn(`Web Chat: Failed to downscale image due to ${error}.`);
    }
  }
}

export default function useSendFiles() {
  const { sendFiles } = useWebChatUIContext();
  const [
    {
      enableUploadThumbnail,
      uploadThumbnailContentType,
      uploadThumbnailHeight,
      uploadThumbnailQuality,
      uploadThumbnailWidth
    }
  ] = useStyleOptions();
  const trackEvent = useTrackEvent();
  const trackTiming = useTrackTiming();

  return useCallback(
    async files => {
      if (files && files.length) {
        trackEvent('sendFiles');

        // TODO: [P3] We need to find revokeObjectURL on the UI side
        //       Redux store should not know about the browser environment
        //       One fix is to use ArrayBuffer instead of object URL, but that would requires change to DirectLineJS
        const attachments = await Promise.all(
          [].map.call(files, async file => {
            let thumbnail;

            if (enableUploadThumbnail) {
              thumbnail = await trackTiming(
                'makeThumbnail',
                makeThumbnail(
                  file,
                  uploadThumbnailWidth,
                  uploadThumbnailHeight,
                  uploadThumbnailContentType,
                  uploadThumbnailQuality
                )
              );
            }

            return {
              name: file.name,
              size: file.size,
              url: window.URL.createObjectURL(file),
              ...(thumbnail && { thumbnail })
            };
          })
        );

        sendFiles(attachments);
      }
    },
    [
      enableUploadThumbnail,
      sendFiles,
      trackEvent,
      trackTiming,
      uploadThumbnailContentType,
      uploadThumbnailHeight,
      uploadThumbnailQuality,
      uploadThumbnailWidth
    ]
  );
}
