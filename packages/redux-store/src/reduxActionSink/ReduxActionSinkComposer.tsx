import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import React, { Fragment, memo, useCallback, useEffect } from 'react';
import { type Action } from 'redux';
import { useRefFrom } from 'use-ref-from';
import { custom, function_, object, optional, pipe, readonly, safeParse, type InferInput } from 'valibot';

import reduxStoreSchema from '../private/reduxStoreSchema';

const reduxActionSinkComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    onAction: custom<(action: Action) => void>(value => safeParse(function_(), value).success),
    store: reduxStoreSchema
  }),
  readonly()
);

type ReduxActionSinkComposerProps = InferInput<typeof reduxActionSinkComposerPropsSchema>;

function ReduxActionSinkComposer(props: ReduxActionSinkComposerProps) {
  const {
    children,
    onAction,
    store: { dispatch }
  } = validateProps(reduxActionSinkComposerPropsSchema, props);

  const onActionRef = useRefFrom(onAction);

  // #region Replicate to Redux store
  const handleAction = useCallback(action => onActionRef.current?.(action), [onActionRef]);

  useEffect(() => {
    dispatch({ payload: { sink: handleAction }, type: 'WEB_CHAT_INTERNAL/REGISTER_ACTION_SINK' });

    return () => {
      dispatch({ payload: { sink: handleAction }, type: 'WEB_CHAT_INTERNAL/UNREGISTER_ACTION_SINK' });
    };
  }, [dispatch, handleAction]);
  // #endregion

  return <Fragment>{children}</Fragment>;
}

export default memo(ReduxActionSinkComposer);

export { reduxActionSinkComposerPropsSchema, type ReduxActionSinkComposerProps };
