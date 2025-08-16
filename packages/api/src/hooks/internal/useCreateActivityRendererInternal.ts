import {
  type ActivityComponentFactory,
  type RenderAttachment
} from '@msinternal/botframework-webchat-middleware/legacy';
import { useCallback } from 'react';

import { useBuildRenderActivityCallback } from '@msinternal/botframework-webchat-middleware';

// TODO: [P*] Add tests.
export default function useCreateActivityRendererInternal(
  /**
   * TODO: [P*] Need a deprecation path.
   *
   * @deprecated
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderAttachmentOverride?: RenderAttachment
): ActivityComponentFactory {
  const render = useBuildRenderActivityCallback();

  return useCallback(
    ({ activity }) =>
      () =>
        render({ activity })?.({}),
    [render]
  );
}
