import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { type Store } from 'redux';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import reduxStoreSchema from './private/reduxStoreSchema';
import ReduxContext, { type ReduxContextType } from './ReduxContext';

const reduxProviderPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    store: reduxStoreSchema
  }),
  readonly()
);

// Not `InferReactProps`: its `type-fest` import leaves a global-augmentation-only chunk in api's d.ts, which `tsd` rejects.
type ReduxProviderProps = InferInput<typeof reduxProviderPropsSchema>;

function createBatchedSubscribe(store: Store): ReduxContextType['subscribe'] {
  const listeners = new Set<() => void>();
  let unsubscribeStore: (() => void) | undefined;

  return listener => {
    listeners.add(listener);

    // One store subscription notifies every hook in one batch, so they re-render together, as with react-redux@7.
    // Remove `unstable_batchedUpdates()` when every supported React renders with `createRoot()`: legacy `ReactDOM.render()` does not batch updates outside event handlers.
    unsubscribeStore ||= store.subscribe(() =>
      unstable_batchedUpdates(() => listeners.forEach(listener => listener()))
    );

    return () => {
      listeners.delete(listener);

      if (!listeners.size) {
        unsubscribeStore?.();
        unsubscribeStore = undefined;
      }
    };
  };
}

function ReduxProvider(props: ReduxProviderProps) {
  const { children, store } = validateProps(reduxProviderPropsSchema, props);

  const context = useMemo<ReduxContextType>(
    () => Object.freeze({ store, subscribe: createBatchedSubscribe(store) }),
    [store]
  );

  return <ReduxContext.Provider value={context}>{children}</ReduxContext.Provider>;
}

ReduxProvider.displayName = 'ReduxProvider';

export default memo(ReduxProvider);
export { reduxProviderPropsSchema, type ReduxProviderProps };
