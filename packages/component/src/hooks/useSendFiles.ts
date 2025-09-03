import { hooks } from 'botframework-webchat-api';
import { useCallback } from 'react';

import useMakeThumbnail from './useMakeThumbnail';

const { useSendFiles: useAPISendFiles } = hooks;

type PostActivityFile = Parameters<ReturnType<typeof useAPISendFiles>>[0][0];

/**
 * @deprecated This hook will be removed on or after 2026-04-03. Please use `useSendMessage` instead.
 */
export default function useSendFiles(): (files: readonly File[]) => void {
  const makeThumbnail = useMakeThumbnail();
  const sendFiles = useAPISendFiles();

  return useCallback(
    files => {
      // We intentionally not returning a Promise.
      // This is the because the Promise returned never tell if the message has successfully sent or not.
      // Until we have that signal, we should not return Promise.
      (async function () {
        files &&
          files.length &&
          sendFiles(
            await Promise.all(
              files.map<Promise<PostActivityFile>>(file =>
                // To maintain backward compatibility, this hook should look at file extension instead of MIME type.
                makeThumbnail(
                  file,
                  /\.(gif|jpe?g|png)$/iu.test(file.name) ? 'image/*' : 'application/octet-stream'
                ).then(thumbnailURL => ({
                  name: file.name,
                  size: file.size,
                  thumbnail: thumbnailURL?.toString(),
                  // The URL is passed to chat adapter and should be treated as binary.
                  // eslint-disable-next-line no-restricted-properties
                  url: URL.createObjectURL(new Blob([file], { type: 'application/octet-stream' }))
                }))
              )
            )
          );
      })();
    },
    [makeThumbnail, sendFiles]
  );
}
