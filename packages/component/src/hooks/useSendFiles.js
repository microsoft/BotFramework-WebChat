import { useCallback } from 'react';

import downscaleImageToDataURL from '../Utils/downscaleImageToDataURL';
import useStyleOptions from '../hooks/useStyleOptions';
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

  return useCallback(
    async files => {
      if (files && files.length) {
        // TODO: [P3] We need to find revokeObjectURL on the UI side
        //       Redux store should not know about the browser environment
        //       One fix is to use ArrayBuffer instead of object URL, but that would requires change to DirectLineJS
        sendFiles(
          await Promise.all(
            [].map.call(files, async file => ({
              name: file.name,
              size: file.size,
              url: window.URL.createObjectURL(file),
              ...(enableUploadThumbnail && {
                thumbnail: await makeThumbnail(
                  file,
                  uploadThumbnailWidth,
                  uploadThumbnailHeight,
                  uploadThumbnailContentType,
                  uploadThumbnailQuality
                )
              })
            }))
          )
        );
      }
    },
    [
      enableUploadThumbnail,
      sendFiles,
      uploadThumbnailContentType,
      uploadThumbnailHeight,
      uploadThumbnailQuality,
      uploadThumbnailWidth
    ]
  );
}
