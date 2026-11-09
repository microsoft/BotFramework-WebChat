import {
  connect as createConnectAction,
  disconnect,
  setLanguage,
  setSendTypingIndicator,
  type DirectLineJSBotConnection
} from 'botframework-webchat-core';
import React, { Fragment, memo, useEffect, type ReactNode } from 'react';

import { useDispatch } from '../../hooks/internal/WebChatReduxContext';
import connectWithDeferredDisconnect from '../private/connectWithDeferredDisconnect';

function noop() {
  // The host or <Composer> owns the store: nothing to release.
}

// These are props of <Composer>, already checked by its valibot schema (`validateProps()`). They are not validated
// again: an invalid value should warn, as before, instead of throwing.
type ReduxSessionEffectsProps = {
  readonly children?: ReactNode | undefined;
  readonly directLine: DirectLineJSBotConnection;
  readonly locale?: string | undefined;
  readonly sendTypingIndicator?: boolean | undefined;
  readonly userID?: string | undefined;
  readonly username?: string | undefined;
};

/**
 * Keeps the Redux store in sync with the session props: language, typing indicator, and the connection.
 *
 * It wraps the rest of <Composer>, so these effects run after the effects of its children, as they did in <Composer>.
 */
function ReduxSessionEffects({
  children,
  directLine,
  // Same defaults as <Composer>.
  locale = window.navigator.language || 'en-US',
  sendTypingIndicator = false,
  userID = '',
  username = ''
}: ReduxSessionEffectsProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLanguage(locale));
  }, [dispatch, locale]);

  useEffect(() => {
    dispatch(setSendTypingIndicator(!!sendTypingIndicator));
  }, [dispatch, sendTypingIndicator]);

  // Strict Mode, swaps and unmount: see connectWithDeferredDisconnect(), shared with the default providers.
  useEffect(
    () =>
      connectWithDeferredDisconnect({
        connect: () => dispatch(createConnectAction({ directLine, userID, username })),
        directLine,
        disconnect: () => dispatch(disconnect()),
        owner: dispatch,
        release: noop,
        userID,
        username
      }),
    [dispatch, directLine, userID, username]
  );

  return <Fragment>{children}</Fragment>;
}

ReduxSessionEffects.displayName = 'ReduxSessionEffects';

export default memo(ReduxSessionEffects);
export { type ReduxSessionEffectsProps };
