import useActivityTreeContext from './private/useContext';

import type { ReadonlyActivityTree } from './private/types';

export default function useActivityTreeWithRenderer(): readonly [ReadonlyActivityTree] {
  return useActivityTreeContext().activityTreeWithRendererState;
}
