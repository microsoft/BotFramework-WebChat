import { RestrictedDebugAPI } from 'botframework-webchat-core/internal';
import type { ArrayElement } from 'type-fest';

const BREAKPOINT_NAMES = ['render'] as const;

type ActivityBreakpointName = ArrayElement<typeof BREAKPOINT_NAMES>;
type ActivityDebugContext = { readonly activity: any };

class RestrictedActivityDebugAPI extends RestrictedDebugAPI<ActivityBreakpointName, ActivityDebugContext> {
  constructor(getActivity: () => any) {
    super(BREAKPOINT_NAMES, Object.freeze({ activity: getActivity }));
  }
}

export default RestrictedActivityDebugAPI;
