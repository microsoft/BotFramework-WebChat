import { type DirectLineJSBotConnection } from 'botframework-webchat-core';
import {
  type ConnectionService,
  type OutgoingService,
  type SendBoxService
} from 'botframework-webchat-core/internal.js';
import React, { Fragment, memo, useEffect, type ReactNode } from 'react';

import connectWithDeferredDisconnect from '../private/connectWithDeferredDisconnect';
import { deleteTestHandle, setTestHandle, type TestHandle } from './private/testHandles';

// These are props of <Composer>, already checked by its `propTypes`. They are not validated again: an invalid value
// should warn, as in Redux mode, instead of throwing.
type DefaultSessionEffectsProps = {
  readonly children?: ReactNode | undefined;
  readonly connection: Pick<ConnectionService, 'connect' | 'disconnect' | 'dispose'>;
  readonly directLine?: DirectLineJSBotConnection | undefined;
  readonly locale?: string | undefined;
  readonly outgoing: Pick<OutgoingService, 'setLocale'>;
  readonly sendBox: Pick<SendBoxService, 'setSendTypingIndicator'>;
  readonly sendTypingIndicator?: boolean | undefined;
  /** For tests only: registered for the Direct Line while connected, see `getTestHandle()`. */
  readonly testHandle: TestHandle;
  readonly userID?: string | undefined;
  readonly username?: string | undefined;
};

/**
 * Keeps the services in sync with the session props of <Composer>, as `<ReduxSessionEffects>` does with the Redux store:
 * language, typing indicator, and the connection, with the same deferred disconnect (Strict Mode, swaps, unmount).
 * After the last disconnect, the connection service is disposed.
 *
 * It wraps the rest of <Composer>, so its effects run after the effects of its children.
 */
function DefaultSessionEffects({
  children,
  connection,
  directLine,
  // Same defaults as <Composer>.
  locale = window.navigator.language || 'en-US',
  outgoing,
  sendBox,
  sendTypingIndicator = false,
  testHandle,
  userID = '',
  username = ''
}: DefaultSessionEffectsProps) {
  // In the order of <ReduxSessionEffects>: language, typing indicator, then the connection.
  useEffect(() => {
    outgoing.setLocale(locale);
  }, [locale, outgoing]);

  useEffect(() => {
    sendBox.setSendTypingIndicator(!!sendTypingIndicator);
  }, [sendBox, sendTypingIndicator]);

  useEffect(
    () =>
      // Without Direct Line (specs of the providers only), there is nothing to connect.
      directLine
        ? connectWithDeferredDisconnect({
            connect: () => {
              setTestHandle(directLine, testHandle);
              connection.connect({ directLine, userID, username });
            },
            directLine,
            disconnect: connection.disconnect,
            owner: connection,
            release: () => {
              deleteTestHandle(directLine, testHandle);
              connection.dispose();
            },
            userID,
            username
          })
        : undefined,
    [connection, directLine, testHandle, userID, username]
  );

  return <Fragment>{children}</Fragment>;
}

DefaultSessionEffects.displayName = 'DefaultSessionEffects';

export default memo(DefaultSessionEffects);
export { type DefaultSessionEffectsProps };
