import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import reduxStoreSchema from './private/reduxStoreSchema';
import SuggestedActionsComposer from './suggestedActions/SuggestedActionsComposer';

const reduxStoreComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    store: reduxStoreSchema
  }),
  readonly()
);

type ReduxStoreComposerProps = InferInput<typeof reduxStoreComposerPropsSchema>;

/**
 * This composer component reimplements Redux store functionality by React hooks.
 *
 * React hooks will be the source of truth and data will be synchronized to Redux store for backward compatibility.
 */
function ReduxStoreComposer(props: ReduxStoreComposerProps) {
  const { children, store } = validateProps(reduxStoreComposerPropsSchema, props);

  return <SuggestedActionsComposer store={store}>{children}</SuggestedActionsComposer>;
}

export default memo(ReduxStoreComposer);
export { reduxStoreComposerPropsSchema, type ReduxStoreComposerProps };
