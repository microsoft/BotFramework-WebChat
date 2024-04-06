import { hooks } from 'botframework-webchat-api';
import { useCallback } from 'react';
import { useRefFrom } from 'use-ref-from';

import downscaleImageToDataURL from '../../Utils/downscaleImageToDataURL/index';

const { useStyleOptions, useTrackTiming } = hooks;

async function makeThumbnail(
  file: File,
  width: number,
  height: number,
  contentType: string,
  quality: number
): Promise<URL | undefined> {
  try {
    return await downscaleImageToDataURL(file, width, height, contentType, quality);
  } catch (error) {
    console.warn(`Web Chat: Failed to downscale image due to ${error}.`);
  }
}

export default function useMakeThumbnail(): (file: File) => Promise<undefined | URL> {
  const [styleOptions] = useStyleOptions();
  const trackTiming = useTrackTiming<undefined | URL>();

  const styleOptionsRef = useRefFrom(styleOptions);

  // TODO: [P3] We need to find revokeObjectURL on the UI side
  //       Redux store should not know about the browser environment
  //       One fix is to use ArrayBuffer instead of object URL, but that would requires change to DirectLineJS
  return useCallback<(file: File) => Promise<undefined | URL>>(
    (file: File): Promise<undefined | URL> => {
      const {
        current: {
          enableUploadThumbnail,
          uploadThumbnailContentType,
          uploadThumbnailHeight,
          uploadThumbnailQuality,
          uploadThumbnailWidth
        }
      } = styleOptionsRef;

      if (enableUploadThumbnail && file instanceof File && file.type.startsWith('image/')) {
        return trackTiming(
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

      return Promise.resolve<undefined>(undefined);
    },
    [styleOptionsRef, trackTiming]
  );
}
