import { hooks } from 'botframework-webchat-api';
import { useCallback } from 'react';

import downscaleImageToDataURL from '../Utils/downscaleImageToDataURL/index';

const { useSendFiles: useAPISendFiles, useStyleOptions, useTrackTiming } = hooks;

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

export default function useSendFiles(): (files: File[]) => void {
  const sendFiles = useAPISendFiles();
  const [
    {
      enableUploadThumbnail,
      uploadThumbnailContentType,
      uploadThumbnailHeight,
      uploadThumbnailQuality,
      uploadThumbnailWidth
    }
  ] = useStyleOptions();
  const trackTiming = useTrackTiming();

  return useCallback(
    async files => {
      if (files && files.length) {
        files = [].slice.call(files);

        // TODO: [P3] We need to find revokeObjectURL on the UI side
        //       Redux store should not know about the browser environment
        //       One fix is to use ArrayBuffer instead of object URL, but that would requires change to DirectLineJS
        const attachments: {
          name: string;
          size: number;
          url: string;
          thumbnail?: string;
        }[] = await Promise.all(
          Array.from(files).map(async file => {
            let thumbnail;

            if (downscaleImageToDataURL && enableUploadThumbnail && canMakeThumbnail(file)) {
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
          })
        );

        sendFiles(attachments);
      }
    },
    [
      enableUploadThumbnail,
      sendFiles,
      trackTiming,
      uploadThumbnailContentType,
      uploadThumbnailHeight,
      uploadThumbnailQuality,
      uploadThumbnailWidth
    ]
  );
}
