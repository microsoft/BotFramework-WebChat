import { GraphProvider } from '@msinternal/botframework-webchat-api-graph';
import { reactNode, validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo } from 'react';
import { object, optional, pipe, readonly } from 'valibot';

import { useWebChatReduxContext } from './WebChatReduxContext';

const reduxStoreProviderPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type ReduxStoreProviderProps = InferReactProps<typeof reduxStoreProviderPropsSchema>;

/**
 * Renders the graph package's `<GraphProvider>` with the store of `<WebChatReduxProvider>`, following it through the subscription of `useSelector()`.
 *
 * React 16/17 then re-render `<GraphProvider>` in the same batch as the selectors, after the graph has the change.
 */
function ReduxStoreProvider(props: ReduxStoreProviderProps) {
  const { children } = validateProps(reduxStoreProviderPropsSchema, props);
  const { store, subscribe } = useWebChatReduxContext();

  const graphStore = useMemo(() => Object.freeze({ ...store, subscribe }), [store, subscribe]);

  return <GraphProvider store={graphStore}>{children}</GraphProvider>;
}

ReduxStoreProvider.displayName = 'ReduxStoreProvider';

export default memo(ReduxStoreProvider);
export { reduxStoreProviderPropsSchema, type ReduxStoreProviderProps };
