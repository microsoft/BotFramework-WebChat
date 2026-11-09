import { boolean, parse } from 'valibot';

let defaultModeEnabled = false;

const mountCounts = { default: 0, redux: 0 };

/**
 * Whether `<Composer>` without a `store` uses the default providers (no Redux) instead of creating a Redux store.
 *
 * Internal and for tests only, until the default providers are complete. Hosts without a `store` keep a Redux store.
 */
export function internalDefaultModeEnabled(): boolean {
  return defaultModeEnabled;
}

/**
 * For tests only: makes `<Composer>` without a `store` use the default providers (no Redux), from its next render.
 * A `<Composer>` that changes provider set remounts its children.
 */
export function setInternalDefaultModeEnabled(enabled: boolean): void {
  defaultModeEnabled = parse(boolean(), enabled);
}

/** Counts a mount of a provider set, for `getProviderMountCounts()`. */
export function countProviderMount(mode: 'default' | 'redux'): void {
  // `mode` is one of the 2 keys.
  // eslint-disable-next-line security/detect-object-injection
  mountCounts[mode]++;
}

/**
 * For tests only: how many times each provider set mounted on this page, so a test in default mode can check that Web
 * Chat really ran without Redux.
 */
export function getProviderMountCounts(): Readonly<{ default: number; redux: number }> {
  return Object.freeze({ ...mountCounts });
}
