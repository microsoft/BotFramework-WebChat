import {
  connect as createConnectAction,
  disconnect,
  setLanguage,
  setSendTypingIndicator,
  type DirectLineJSBotConnection
} from 'botframework-webchat-core';
import { type DefaultEngine } from 'botframework-webchat-core/internal.js';
import React, { Fragment, memo, useEffect, type ReactNode } from 'react';

import connectWithDeferredDisconnect from '../private/connectWithDeferredDisconnect';
import { deleteTestHandle, setTestHandle, type TestHandle } from './private/testHandles';

// These are props of <Composer>, already checked by its valibot schema (`validateProps()`). They are not validated
// again: an invalid value should warn, as in Redux mode, instead of throwing.
type DefaultSessionEffectsProps = {
  readonly children?: ReactNode | undefined;
  readonly directLine?: DirectLineJSBotConnection | undefined;
  readonly engine: Pick<DefaultEngine, 'dispatch' | 'start' | 'stop'>;
  readonly locale?: string | undefined;
  readonly sendTypingIndicator?: boolean | undefined;
  /** For tests only: registered for the Direct Line while connected, see `getTestHandle()`. */
  readonly testHandle: TestHandle;
  readonly userID?: string | undefined;
  readonly username?: string | undefined;
};

/**
 * Keeps the default engine in sync with the session props of <Composer>, with the same actions as
 * `<ReduxSessionEffects>` dispatches to the Redux store: language, typing indicator, and the connection, with the same
 * deferred disconnect (Strict Mode, swaps, unmount). After the last disconnect, the machines of the engine stop; a
 * connect starts them again (e.g. effects torn down and run again by `<Activity>` of React 19.2).
 *
 * It wraps the rest of <Composer>, so its effects run after the effects of its children.
 */
function DefaultSessionEffects({
  children,
  directLine,
  engine,
  // Same defaults as <Composer>.
  locale = window.navigator.language || 'en-US',
  sendTypingIndicator = false,
  testHandle,
  userID = '',
  username = ''
}: DefaultSessionEffectsProps) {
  const { dispatch } = engine;

  // In the order of <ReduxSessionEffects>: language, typing indicator, then the connection.
  useEffect(() => {
    dispatch(setLanguage(locale));
  }, [dispatch, locale]);

  useEffect(() => {
    dispatch(setSendTypingIndicator(!!sendTypingIndicator));
  }, [dispatch, sendTypingIndicator]);

  useEffect(
    () =>
      // Without Direct Line (specs of the providers only), there is nothing to connect.
      directLine
        ? connectWithDeferredDisconnect({
            connect: () => {
              engine.start();
              setTestHandle(directLine, testHandle);
              dispatch(createConnectAction({ directLine, userID, username }));
            },
            directLine,
            disconnect: () => dispatch(disconnect()),
            owner: engine,
            release: () => {
              deleteTestHandle(directLine, testHandle);
              engine.stop();
            },
            userID,
            username
          })
        : undefined,
    [dispatch, directLine, engine, testHandle, userID, username]
  );

  return <Fragment>{children}</Fragment>;
}

DefaultSessionEffects.displayName = 'DefaultSessionEffects';

export default memo(DefaultSessionEffects);
export { type DefaultSessionEffectsProps };
