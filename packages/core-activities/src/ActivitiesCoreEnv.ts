/**
 * What the activities core needs from the host's globals: only `Date` (`getLogicalTimestamp()`, `patchActivity()`).
 *
 * Core passes its ponyfill, which has this shape.
 */
type ActivitiesCoreEnv = { readonly Date: DateConstructor };

export type { ActivitiesCoreEnv };
