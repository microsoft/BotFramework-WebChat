import { useBuildRenderActivityCallback } from '@msinternal/botframework-webchat-api-middleware';
import {
  type LegacyActivityComponentFactory,
  type LegacyActivityProps
} from '@msinternal/botframework-webchat-api-middleware/legacy';
import { useCallback } from 'react';

/**
 * @deprecated Use useBuildRenderActivityCallback() instead, this hook will be removed on or after 2027-08-16.
 */
export default function useCreateActivityRenderer(): LegacyActivityComponentFactory {
  const render = useBuildRenderActivityCallback();

  return useCallback(
    ({ activity }) =>
      // TODO: [P2] TypeScript turns `{ children?: never | undefined }` into `{ children?: undefined }`.
      //            Thus we are getting a typing error here.
      //            Maybe moving to a stricter tsconfig would help removing the line below.
      //
      //            Use the following commented line once we move to stricter tsconfig.
      //            (props: LegacyActivityProps) =>
      (
        /** @deprecated Some props are only processed by the legacy activity middleware and may not be processed by the newer activity middleware registered via `polymiddleware`. */
        props: LegacyActivityProps & { children?: never }
      ) =>
        render({ activity })?.(props),
    [render]
  );
}
