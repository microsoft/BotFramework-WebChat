import { GraphProvider } from '@msinternal/botframework-webchat-api-graph';
import { reactNode, validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo } from 'react';
import { object, optional, pipe, readonly } from 'valibot';

import { useWebChatReduxContext } from './WebChatReduxContext';

const reduxGraphProviderPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type ReduxGraphProviderProps = InferReactProps<typeof reduxGraphProviderPropsSchema>;

/**
 * `<GraphProvider>` for the store of `<WebChatReduxProvider>`, following it through the subscription of `useSelector()`.
 *
 * React 16/17 then re-render `<GraphProvider>` in the same batch as the selectors, after the graph has the change.
 */
function ReduxGraphProvider(props: ReduxGraphProviderProps) {
  const { children } = validateProps(reduxGraphProviderPropsSchema, props);
  const { store, subscribe } = useWebChatReduxContext();

  const graphStore = useMemo(() => Object.freeze({ ...store, subscribe }), [store, subscribe]);

  return <GraphProvider store={graphStore}>{children}</GraphProvider>;
}

ReduxGraphProvider.displayName = 'ReduxGraphProvider';

export default memo(ReduxGraphProvider);
export { reduxGraphProviderPropsSchema, type ReduxGraphProviderProps };
