import type { GlobalScopeClock } from './internal/GlobalScopeClock';

// TODO: Should we rename this to "globalThisOverrides"?

/**
 * Ponyfills that are supported by Web Chat.
 *
 * If ponyfill is passed, Web Chat will use this ponyfill rather than the one from `globalThis` or `window` object.
 */
export type GlobalScopePonyfill = GlobalScopeClock;
