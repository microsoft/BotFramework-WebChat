import useActivityTreeContext from './private/useContext';

import type { ActivityWithRenderer, ReadonlyActivityTree } from './private/types';

export default function useActivityTreeWithRenderer(options?: { flat?: false }): readonly [ReadonlyActivityTree];
export default function useActivityTreeWithRenderer(options: {
  flat: true;
}): readonly [readonly ActivityWithRenderer[]];

export default function useActivityTreeWithRenderer(options: { flat?: boolean } = {}) {
  const context = useActivityTreeContext();

  return options?.flat === true
    ? context.flattenedActivityTreeWithRendererState
    : context.activityTreeWithRendererState;
}
