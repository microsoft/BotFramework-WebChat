import { useCallback, useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useRenderActivity(renderAttachment) {
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
