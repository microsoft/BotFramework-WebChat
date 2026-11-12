import { reactNode, validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { custom, function_, is, object, optional, pipe, readonly } from 'valibot';

import WebChatReduxContext, { type WebChatReduxContextType, type WebChatReduxStore } from './WebChatReduxContext';

const webChatReduxProviderPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    store: custom<WebChatReduxStore>(value =>
      is(object({ dispatch: function_(), getState: function_(), subscribe: function_() }), value)
    )
  }),
  readonly()
);

type WebChatReduxProviderProps = InferReactProps<typeof webChatReduxProviderPropsSchema>;

function createBatchedSubscribe(store: WebChatReduxStore): WebChatReduxContextType['subscribe'] {
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

function WebChatReduxProvider(props: WebChatReduxProviderProps) {
  const { children, store } = validateProps(webChatReduxProviderPropsSchema, props);

  const context = useMemo<WebChatReduxContextType>(
    () => Object.freeze({ store, subscribe: createBatchedSubscribe(store) }),
    [store]
  );

  return <WebChatReduxContext.Provider value={context}>{children}</WebChatReduxContext.Provider>;
}

WebChatReduxProvider.displayName = 'WebChatReduxProvider';

export default memo(WebChatReduxProvider);
export { webChatReduxProviderPropsSchema, type WebChatReduxProviderProps };
