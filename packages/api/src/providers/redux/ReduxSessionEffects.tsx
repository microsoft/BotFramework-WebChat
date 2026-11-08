import {
  connect as createConnectAction,
  disconnect,
  setLanguage,
  setSendTypingIndicator,
  type DirectLineJSBotConnection
} from 'botframework-webchat-core';
import React, { Fragment, memo, useEffect, type ReactNode } from 'react';

import { useDispatch } from '../../hooks/internal/WebChatReduxContext';

/**
 * Disconnects scheduled by unmounting.
 *
 * Strict Mode unmounts and mounts again right after the first mount, synchronously. DirectLineJS cannot start again after its
 * start is stopped, so unmounting disconnects in a microtask, and mounting again with the same store and connection cancels it.
 * Any other mount with the same store or the same Direct Line disconnects first, in the same order as without deferring.
 *
 * Remove when DirectLineJS can start again after its start is stopped.
 */
const pendingDisconnects = new Set<{
  readonly directLine: DirectLineJSBotConnection;
  readonly dispatch: ReturnType<typeof useDispatch>;
  readonly userID: string | undefined;
  readonly username: string | undefined;
}>();

// These are props of <Composer>, already checked by its `propTypes`. They are not validated again: an invalid value
// should warn, as before, instead of throwing.
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

  useEffect(() => {
    // Mounted again with the same store and connection (e.g. Strict Mode): keep the connection.
    const remountedPendingDisconnect = Array.from(pendingDisconnects).find(
      pendingDisconnect =>
        pendingDisconnect.directLine === directLine &&
        pendingDisconnect.dispatch === dispatch &&
        pendingDisconnect.userID === userID &&
        pendingDisconnect.username === username
    );

    for (const pendingDisconnect of pendingDisconnects) {
      if (
        pendingDisconnect !== remountedPendingDisconnect &&
        (pendingDisconnect.directLine === directLine || pendingDisconnect.dispatch === dispatch)
      ) {
        pendingDisconnects.delete(pendingDisconnect);
        pendingDisconnect.dispatch(disconnect());
      }
    }

    remountedPendingDisconnect
      ? pendingDisconnects.delete(remountedPendingDisconnect)
      : dispatch(
          createConnectAction({
            directLine,
            userID,
            username
          })
        );

    return () => {
      const pendingDisconnect = Object.freeze({ directLine, dispatch, userID, username });

      pendingDisconnects.add(pendingDisconnect);

      /**
       * @todo TODO: [P3] disconnect() is an async call (pending -> fulfilled), we need to wait, or change it to reconnect()
       */
      queueMicrotask(() => pendingDisconnects.delete(pendingDisconnect) && dispatch(disconnect()));
    };
  }, [dispatch, directLine, userID, username]);

  return <Fragment>{children}</Fragment>;
}

ReduxSessionEffects.displayName = 'ReduxSessionEffects';

export default memo(ReduxSessionEffects);
export { type ReduxSessionEffectsProps };
