import { hooks } from 'botframework-webchat-api';
import { useCallback } from 'react';

import useMakeThumbnail from './internal/useMakeThumbnail';

const { useSendMessage: useAPISendMessage } = hooks;

type SendMessage = (
  text?: string,
  method?: string,
  init?: { channelData?: any; files?: Iterable<File> | undefined }
) => void;

export default function useSendMessage(): SendMessage {
  const makeThumbnail = useMakeThumbnail();
  const sendMessage = useAPISendMessage();

  return useCallback<SendMessage>(
    async (text, method, { channelData, files } = {}) => {
      sendMessage(text, method, {
        attachments: files
          ? await Promise.all(
              await Promise.all(
                [...files].map(blob => makeThumbnail(blob).then(thumbnailURL => ({ blob, thumbnailURL })))
              )
            )
          : [],
        channelData
      });
    },
    [makeThumbnail, sendMessage]
  );
}
