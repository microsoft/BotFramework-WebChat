import { type DirectLineJSBotConnection } from 'botframework-webchat-core';
import { type ConnectionService } from 'botframework-webchat-core/internal.js';
import React, { Fragment, memo, useEffect, type ReactNode } from 'react';

import connectWithDeferredDisconnect from '../private/connectWithDeferredDisconnect';
import { deleteTestHandle, setTestHandle, type TestHandle } from './private/testHandles';

// These are props of <Composer>, already checked by its `propTypes`. They are not validated again: an invalid value
// should warn, as in Redux mode, instead of throwing.
type DefaultSessionEffectsProps = {
  readonly children?: ReactNode | undefined;
  readonly connection: Pick<ConnectionService, 'connect' | 'disconnect' | 'dispose'>;
  readonly directLine?: DirectLineJSBotConnection | undefined;
  /** For tests only: registered for the Direct Line while connected, see `getTestHandle()`. */
  readonly testHandle: TestHandle;
  readonly userID?: string | undefined;
  readonly username?: string | undefined;
};

/**
 * Connects the connection service to the Direct Line of <Composer>, as `<ReduxSessionEffects>` does with the Redux store,
 * with the same deferred disconnect (Strict Mode, swaps, unmount). After the last disconnect, the service is disposed.
 *
 * It wraps the rest of <Composer>, so its effects run after the effects of its children.
 */
function DefaultSessionEffects({
  children,
  connection,
  directLine,
  testHandle,
  // Same defaults as <Composer>.
  userID = '',
  username = ''
}: DefaultSessionEffectsProps) {
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
