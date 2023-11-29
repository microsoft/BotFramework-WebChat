import { type WebChatActivity } from 'botframework-webchat-core';

import useAllActivities from './private/AllActivities/useAllActivities';
import useLatestActivities from './private/LatestActivities/useLatestActivities';

type UseActivitiesInit = {
  /**
   * - `"all revision"`: list activities with all their revisions
   * - `"latest revision"` (default): list latest revision only
   */
  mode?: 'all revision' | 'latest revision';
};

/**
 * Gets and subscribes to list of activities.
 *
 * @deprecated 2023-11-25 Please set "mode", default to "latest revision".
 */
export default function useActivities(): readonly [readonly Readonly<WebChatActivity>[]];

/**
 * Gets and subscribes to list of activities.
 *
 * @param {string} init.mode - When set to "all revision", list activities with all their revisions, otherwise, list latest revision only.
 */
export default function useActivities(init: UseActivitiesInit): readonly [readonly Readonly<WebChatActivity>[]];

/**
 * Gets and subscribes to list of activities.
 *
 * @param {string} init.mode - When set to "all revision", list activities with all their revisions, otherwise, list latest revision only.
 *
 * @returns List of activities.
 */
export default function useActivities(init: UseActivitiesInit = {}): readonly [readonly Readonly<WebChatActivity>[]] {
  const { mode } = init;

  // Both all/final activities will change when `useActivities()` change.
  // So it is okay to put them together in a single hook.
  const [allActivities] = useAllActivities();
  const [latestActivities] = useLatestActivities();

  return Object.freeze([mode === 'all revision' ? allActivities : latestActivities] as const);
}
