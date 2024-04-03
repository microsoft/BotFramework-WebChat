import { hooks } from 'botframework-webchat-api';
import { useCallback } from 'react';

import useConvertFileToAttachment from './internal/useConvertFileToAttachment';

const { useSendFiles: useAPISendFiles } = hooks;

/**
 * @deprecated This hook will be removed on or after 2026-04-03. Please use `useSendMessage` instead.
 */
export default function useSendFiles(): (files: readonly File[]) => void {
  const sendFiles = useAPISendFiles();
  const convertFileToAttachment = useConvertFileToAttachment();

  return useCallback(
    files => {
      // We intentionally not returning a Promise.
      // This is the because the Promise returned never tell if the message has successfully sent or not.
      // Until we have that signal, we should not return Promise.
      (async function () {
        files && files.length && sendFiles(await Promise.all([...files].map(convertFileToAttachment)));
      })();
    },
    [convertFileToAttachment, sendFiles]
  );
}
