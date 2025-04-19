import type { SendBoxAttachment } from 'botframework-webchat-core';
import { useMemo } from 'react';

import { useSelector } from './internal/WebChatReduxContext';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendBoxAttachments(): readonly [
  readonly SendBoxAttachment[],
  // TODO: This should be Dispatch<SetStateAction<...>>, however Redux doesn't support this signature.
  //       When we move out of Redux, we should change it.
  (attachments: readonly SendBoxAttachment[]) => void
] {
  // TODO: We should use the selector from "core" package.
  const sendBoxAttachments = useSelector(
    ({ sendBoxAttachments }) => sendBoxAttachments as readonly SendBoxAttachment[]
  );
  const { setSendBoxAttachments } = useWebChatAPIContext();

  return useMemo(
    () => Object.freeze([sendBoxAttachments, setSendBoxAttachments]),
    [sendBoxAttachments, setSendBoxAttachments]
  );
}
