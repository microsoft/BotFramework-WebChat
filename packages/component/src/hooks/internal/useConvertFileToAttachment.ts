import { hooks } from 'botframework-webchat-api';
import type { WebChatPostActivityAttachment } from 'botframework-webchat-core';
import { useCallback } from 'react';
import { useRefFrom } from 'use-ref-from';

import downscaleImageToDataURL from '../../Utils/downscaleImageToDataURL/index';

const { useStyleOptions, useTrackTiming } = hooks;

function canMakeThumbnail({ name }) {
  return /\.(gif|jpe?g|png)$/iu.test(name);
}

async function makeThumbnail(file, width, height, contentType, quality) {
  try {
    return await downscaleImageToDataURL(file, width, height, contentType, quality);
  } catch (error) {
    console.warn(`Web Chat: Failed to downscale image due to ${error}.`);
  }
}

export default function useConvertFileToAttachment(): (file: File) => Promise<WebChatPostActivityAttachment> {
  const [styleOptions] = useStyleOptions();
  const trackTiming = useTrackTiming();

  const styleOptionsRef = useRefFrom(styleOptions);

  // TODO: [P3] We need to find revokeObjectURL on the UI side
  //       Redux store should not know about the browser environment
  //       One fix is to use ArrayBuffer instead of object URL, but that would requires change to DirectLineJS
  return useCallback<(file: File) => Promise<WebChatPostActivityAttachment>>(
    async file => {
      const {
        current: {
          enableUploadThumbnail,
          uploadThumbnailContentType,
          uploadThumbnailHeight,
          uploadThumbnailQuality,
          uploadThumbnailWidth
        }
      } = styleOptionsRef;

      let thumbnail;

      if (enableUploadThumbnail && canMakeThumbnail(file)) {
        thumbnail = await trackTiming(
          'sendFiles:makeThumbnail',
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
    },
    [styleOptionsRef, trackTiming]
  );
}
