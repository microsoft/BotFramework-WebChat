import { GraphProvider } from '@msinternal/botframework-webchat-api-graph';
import { ReduxStoreComposer } from '@msinternal/botframework-webchat-redux-store';
import { createStoreWithOptions } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';

import usePonyfill from '../../hooks/usePonyfill';
import { type WebChatReduxStore } from '../../hooks/internal/WebChatReduxContext';
import WebChatReduxProvider from '../../hooks/internal/WebChatReduxProvider';
import ReduxActivitiesCrossCheck from './ReduxActivitiesCrossCheck';
import ReduxDomainBridge from './ReduxDomainBridge';
import ReduxSessionEffects, { type ReduxSessionEffectsProps } from './ReduxSessionEffects';

declare const process: {
  env: {
    NODE_ENV?: string | undefined;
  };
};

type ReduxProvidersProps = ReduxSessionEffectsProps & {
  /** The store of the host. Without it, a store is created. */
  readonly store?: WebChatReduxStore | undefined;
};

/**
 * The providers of <Composer> over a Redux store: the store, suggested actions mirrored to the store, activities, the
 * domain contexts and the session effects. In development builds, it also checks the activities against the store.
 */
function ReduxProviders({
  children,
  directLine,
  locale,
  sendTypingIndicator,
  store,
  userID,
  username
}: ReduxProvidersProps) {
  const [ponyfill] = usePonyfill();

  // We will create a Redux store if it was not passed in
  const memoizedStore = useMemo(() => {
    const nextStore = store || createStoreWithOptions({ ponyfill });

    const storePonyfill = nextStore.getState().internal?.ponyfill || {};

    const keys = new Set([...Object.keys(storePonyfill), ...Object.keys(ponyfill)]);

    // Filter out forbidden properties.
    keys.delete('prototype');

    Object.getOwnPropertyNames(Object.prototype).forEach(key => {
      keys.delete(key);
    });

    const nativeFunction = (fn: (...args: unknown[]) => unknown): boolean =>
      typeof fn === 'function' && ('' + fn).endsWith('() { [native code] }');

    const ponyfillFunctionEquals = (x: (...args: unknown[]) => unknown, y: (...args: unknown[]) => unknown) =>
      (nativeFunction(x) && nativeFunction(y)) || x === y;

    // We have filtered out all forbidden properties.
    // eslint-disable-next-line security/detect-object-injection
    const differentKeys = Array.from(keys).filter(key => !ponyfillFunctionEquals(storePonyfill[key], ponyfill[key]));

    if (differentKeys.length) {
      console.warn(
        `botframework-webchat: Ponyfill used in store should match the ponyfill passed in props: ${differentKeys.join(
          ', '
        )}`
      );
    }

    return nextStore;
  }, [ponyfill, store]);

  return (
    <WebChatReduxProvider store={memoizedStore}>
      <ReduxStoreComposer store={memoizedStore}>
        <GraphProvider store={memoizedStore}>
          <ReduxDomainBridge>
            <ReduxSessionEffects
              directLine={directLine}
              locale={locale}
              sendTypingIndicator={sendTypingIndicator}
              userID={userID}
              username={username}
            >
              {process.env.NODE_ENV !== 'production' && <ReduxActivitiesCrossCheck />}
              {children}
            </ReduxSessionEffects>
          </ReduxDomainBridge>
        </GraphProvider>
      </ReduxStoreComposer>
    </WebChatReduxProvider>
  );
}

ReduxProviders.displayName = 'ReduxProviders';

export default memo(ReduxProviders);
export { type ReduxProvidersProps };
