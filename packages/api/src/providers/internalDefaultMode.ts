import { boolean, parse } from 'valibot';

let defaultModeEnabled = false;

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
