import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';

/**
 * Creates a Redux reducer to store the ponyfill.
 *
 * The ponyfill is used to check if React and Redux does not use a matching ponyfill.
 */
export default function createInternalReducer(ponyfill: GlobalScopePonyfill): () => { ponyfill: GlobalScopePonyfill } {
  return () => ({ ponyfill });
}
