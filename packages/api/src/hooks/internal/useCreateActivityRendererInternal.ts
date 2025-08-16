import {
  type LegacyActivityComponentFactory,
  type LegacyActivityProps
} from '@msinternal/botframework-webchat-middleware/legacy';
import { useCallback } from 'react';

import { useBuildRenderActivityCallback } from '@msinternal/botframework-webchat-middleware';

// TODO: [P*] Add tests.
export default function useCreateActivityRendererInternal(): LegacyActivityComponentFactory {
  const render = useBuildRenderActivityCallback();

  return useCallback(
    ({ activity }) =>
      // TODO: [P2] TypeScript turns `{ children?: never | undefined }` into `{ children?: undefined }`.
      //            Thus we are getting a typing error here.
      //            Maybe moving to a stricter tsconfig would help removing the line below.
      //
      //            Use the following commented line once we move to stricter tsconfig.
      //            (props: LegacyActivityProps) =>
      (props: LegacyActivityProps & { children?: never }) =>
        render({ activity })?.(props),
    [render]
  );
}
