import type { SendBoxAttachment } from 'botframework-webchat-core';
import { useMemo } from 'react';

import { useSelector } from './internal/WebChatReduxContext';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

// TODO: We should use the selector from "core" package.
const selectSendBoxAttachments = ({ sendBoxAttachments }) => sendBoxAttachments as readonly SendBoxAttachment[];

export default function useSendBoxAttachments(): readonly [
  readonly SendBoxAttachment[],
  // TODO: This should be Dispatch<SetStateAction<...>>, however Redux doesn't support this signature.
  //       When we move out of Redux, we should change it.
  (attachments: readonly SendBoxAttachment[]) => void
] {
  const sendBoxAttachments = useSelector(selectSendBoxAttachments);
  const { setSendBoxAttachments } = useWebChatAPIContext();

  return useMemo(
    () => Object.freeze([sendBoxAttachments, setSendBoxAttachments]),
    [sendBoxAttachments, setSendBoxAttachments]
  );
}
