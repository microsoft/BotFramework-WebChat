import { useCallback, useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useRenderActivity(renderAttachment) {
  if (typeof renderAttachment !== 'function') {
    throw new Error('botframework-webchat: First argument passed to "useRenderActivity" must be a function.');
  }

  const { activityRenderer } = useContext(WebChatUIContext);

  return useCallback(
    ({ activity, ...renderActivityArgs }) =>
      activityRenderer({
        activity,
        ...renderActivityArgs
      })(renderAttachmentArgs =>
        renderAttachment({
          activity,
          ...renderAttachmentArgs
        })
      ),
    [activityRenderer, renderAttachment]
  );
}
