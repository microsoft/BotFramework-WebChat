import { GraphProvider } from '@msinternal/botframework-webchat-api-graph';
import { ReduxStoreComposer } from '@msinternal/botframework-webchat-redux-store';
import React, { memo } from 'react';

import { type WebChatReduxStore } from '../../hooks/internal/WebChatReduxContext';
import WebChatReduxProvider from '../../hooks/internal/WebChatReduxProvider';
import ReduxDomainBridge from './ReduxDomainBridge';
import ReduxSessionEffects, { type ReduxSessionEffectsProps } from './ReduxSessionEffects';

type ReduxProvidersProps = ReduxSessionEffectsProps & {
  readonly store: WebChatReduxStore;
};

/**
 * The providers of <Composer> over a Redux store: the store, suggested actions mirrored to the store, activities, the
 * domain contexts and the session effects.
 */
function ReduxProviders({
  children,
  directLine,
  locale,
  sendTypingIndicator,
  store,
  userID,
  username
}: ReduxProvidersProps) {
  return (
    <WebChatReduxProvider store={store}>
      <ReduxStoreComposer store={store}>
        <GraphProvider store={store}>
          <ReduxDomainBridge>
            <ReduxSessionEffects
              directLine={directLine}
              locale={locale}
              sendTypingIndicator={sendTypingIndicator}
              userID={userID}
              username={username}
            >
              {children}
            </ReduxSessionEffects>
          </ReduxDomainBridge>
        </GraphProvider>
      </ReduxStoreComposer>
    </WebChatReduxProvider>
  );
}

ReduxProviders.displayName = 'ReduxProviders';

export default memo(ReduxProviders);
export { type ReduxProvidersProps };
