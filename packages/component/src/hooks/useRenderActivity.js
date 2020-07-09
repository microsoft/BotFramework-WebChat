import { useCallback, useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useRenderActivity(renderAttachment) {
  if (typeof renderAttachment !== 'undefined') {
    throw new Error('botframework-webchat: "renderAttachment" argument is deprecated. TBC.');
  }

  // if (typeof renderAttachment !== 'function') {
  //   throw new Error('botframework-webchat: First argument passed to "useRenderActivity" must be a function.');
  // }

  const { activityRenderer } = useContext(WebChatUIContext);

  return activityRenderer;

  // return useCallback(
  //   ({ activity, ...renderActivityArgs }) =>
  //     activityRenderer({
  //       activity,
  //       ...renderActivityArgs
  //     })(renderAttachmentArgs =>
  //       renderAttachment({
  //         activity,
  //         ...renderAttachmentArgs
  //       })
  //     ),
  //   [activityRenderer, renderAttachment]
  // );
}
