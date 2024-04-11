import { hooks } from 'botframework-webchat-api';
import { type SendBoxAttachment } from 'botframework-webchat-core';
import { useCallback } from 'react';

import useMakeThumbnail from './useMakeThumbnail';

const { useSendMessage: useAPISendMessage } = hooks;

type SendMessage = (
  text?: string,
  method?: string,
  init?: {
    attachments?: Iterable<SendBoxAttachment> | undefined;
    channelData?: any;
  }
) => void;

export default function useSendMessage(): SendMessage {
  const makeThumbnail = useMakeThumbnail();
  const sendMessage = useAPISendMessage();

  return useCallback<SendMessage>(
    async (text, method, { channelData, attachments } = {}) => {
      sendMessage(text, method, {
        attachments: attachments
          ? await Promise.all(
              [...attachments].map(async ({ blob, thumbnailURL }) => {
                if (!thumbnailURL && blob instanceof File) {
                  thumbnailURL = await makeThumbnail(blob);
                }

                return { blob, thumbnailURL };
              })
            )
          : [],
        channelData
      });
    },
    [makeThumbnail, sendMessage]
  );
}
