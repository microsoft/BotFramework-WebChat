import { createStoreWithOptions, type GlobalScopePonyfill } from 'botframework-webchat-core';
import { createWebChatEngine, type EngineStore } from 'botframework-webchat-core/internal.js';
import { boolean, parse } from 'valibot';

let webChatEngineEnabled = false;

const storeCounts = { engine: 0, redux: 0 };

/**
 * For tests only: makes `<Composer>` without a `store` create the Web Chat engine instead of a Redux store, from the
 * next store it creates. Hosts that pass a `store` are not affected.
 *
 * Internal until the engine replaces the Redux store.
 */
export function setWebChatEngineEnabled(enabled: boolean): void {
  webChatEngineEnabled = parse(boolean(), enabled);
}

/**
 * For tests only: how many stores `<Composer>` without a `store` created on this page, by kind, so a test with the
 * engine enabled can check that no Redux store was created.
 */
export function getStoreCounts(): Readonly<{ engine: number; redux: number }> {
  return Object.freeze({ ...storeCounts });
}

/** Creates the store of `<Composer>` without a `store`: the engine if enabled, otherwise a Redux store. */
export function createDefaultStore(options: Readonly<{ ponyfill: Partial<GlobalScopePonyfill> }>): EngineStore {
  if (webChatEngineEnabled) {
    storeCounts.engine++;

    return createWebChatEngine(options);
  }

  storeCounts.redux++;

  return createStoreWithOptions(options);
}
