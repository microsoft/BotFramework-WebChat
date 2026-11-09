import { GraphProvider } from '@msinternal/botframework-webchat-api-graph';
import { SuggestedActionsComposer, SuggestedActionsSubscriber } from '@msinternal/botframework-webchat-redux-store';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { sendMessage } from 'botframework-webchat-core';
import {
  createActivitiesStore,
  createConnectionService,
  createEmitter,
  createIncomingService,
  createNotificationsCell,
  createOutgoingService,
  createSagaQueue,
  createSendBoxService,
  createSpeechService,
  createVoiceService,
  type ActivitiesStore,
  type Notify,
  type SuggestedActionsEmitter
} from 'botframework-webchat-core/internal.js';
import React, { memo, useEffect, useMemo } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { custom, function_, is, object, optional, pipe, readonly, unknown, type InferInput } from 'valibot';

import usePonyfill from '../../hooks/usePonyfill';
import { countProviderMount } from '../internalDefaultMode';
import DefaultDomainProviders from './DefaultDomainProviders';
import DefaultSessionEffects from './DefaultSessionEffects';
import createGraphStoreFromActivitiesStore from './private/createGraphStoreFromActivitiesStore';

const defaultProvidersPropsSchema = pipe(
  object({
    /** For tests: the activities store to read, instead of one created on mount. */
    activitiesStore: optional(
      custom<ActivitiesStore>(value =>
        is(object({ getSnapshot: function_(), receiveActivity: function_(), subscribe: function_() }), value)
      )
    ),
    children: optional(reactNode()),
    // Props of <Composer>, checked by its valibot schema (`validateProps()`): not validated again, as in Redux mode.
    directLine: optional(unknown()),
    locale: optional(unknown()),
    sendTypingIndicator: optional(unknown()),
    userID: optional(unknown()),
    username: optional(unknown())
  }),
  readonly()
);

type DefaultProvidersProps = InferInput<typeof defaultProvidersPropsSchema>;

// One change of a service notifies every hook reading it in one batch, as the Redux providers do.
// Remove `unstable_batchedUpdates()` when every supported React renders with `createRoot()`.
const notify: Notify = callListeners => unstable_batchedUpdates(callListeners);

/**
 * The providers of `<Composer>` without Redux: suggested actions, activities from the activities store, connectivity,
 * notifications, outgoing activities, the send box, speech and voice from the services, and the domain contexts.
 * Internal: the default providers are used only when switched on for tests, until they become the default.
 */
function DefaultProviders(props: DefaultProvidersProps) {
  const {
    activitiesStore: activitiesStoreFromProps,
    children,
    directLine,
    locale,
    sendTypingIndicator,
    userID,
    username
  } = validateProps(defaultProvidersPropsSchema, props);
  const [ponyfill] = usePonyfill();

  // As the Redux store that <Composer> creates: one set per ponyfill, which cannot change after the first render.
  // Creating them does nothing else (no subscription, no timer), so the set of a discarded render is simply dropped.
  const services = useMemo(() => {
    const activitiesStore = activitiesStoreFromProps || createActivitiesStore({ ponyfill });
    // One queue for the services, as redux-saga has one for the sagas: what they do after an operation, in order.
    const queue = createSagaQueue();
    const notifications = createNotificationsCell({ notify, ponyfill });
    const connection = createConnectionService({ notifications, notify, ponyfill });
    // Set by the incoming activities, cleared by the outgoing messages and clearSuggestedActions().
    const suggestedActions: SuggestedActionsEmitter = createEmitter();
    const voice = createVoiceService({ notify });
    const incoming = createIncomingService({
      activitiesStore,
      connection,
      ponyfill,
      queue,
      suggestedActions,
      voice: voice.port
    });
    // Started when online in this order, as the sagas: outgoing activities, the send box, then speech.
    const outgoing = createOutgoingService({
      activitiesStore,
      connection,
      incoming,
      ponyfill,
      queue,
      suggestedActions
    });
    const sendBox = createSendBoxService({
      connection,
      // As in Redux mode, the action creator builds and validates the message.
      createSendMessagePayload: (text, method, init) => sendMessage(text, method, init).payload,
      notify,
      outgoing,
      ponyfill,
      queue
    });
    const speech = createSpeechService({ activitiesStore, connection, incoming, notify, queue });
    const testHandle = Object.freeze({
      getActivities: () => activitiesStore.getSnapshot().sortedActivities,
      getConnectivityStatus: () => connection.connectivityStatus.get(),
      getDictateState: () => speech.dictateState.get(),
      getMicrophoneMuted: () => voice.microphoneMuted.get(),
      getSendBoxValue: () => sendBox.value.get(),
      getVoiceState: () => voice.voiceState.get(),
      postActivity: (activity, method?: string) => outgoing.postActivity(activity, method)
    });

    return Object.freeze({
      activitiesStore,
      connection,
      incoming,
      notifications,
      outgoing,
      sendBox,
      speech,
      suggestedActions,
      testHandle,
      voice
    });
  }, [activitiesStoreFromProps, ponyfill]);

  const graphStore = useMemo(
    () => createGraphStoreFromActivitiesStore(services.activitiesStore),
    [services.activitiesStore]
  );

  useEffect(() => {
    countProviderMount('default');
  }, []);

  return (
    <SuggestedActionsComposer>
      <SuggestedActionsSubscriber subscribe={services.suggestedActions.subscribe}>
        <GraphProvider store={graphStore}>
          <DefaultDomainProviders
            connection={services.connection}
            notifications={services.notifications}
            outgoing={services.outgoing}
            sendBox={services.sendBox}
            speech={services.speech}
            suggestedActions={services.suggestedActions}
            voice={services.voice}
          >
            <DefaultSessionEffects
              connection={services.connection}
              directLine={directLine}
              locale={locale as string | undefined}
              outgoing={services.outgoing}
              sendBox={services.sendBox}
              sendTypingIndicator={sendTypingIndicator as boolean | undefined}
              testHandle={services.testHandle}
              userID={userID as string | undefined}
              username={username as string | undefined}
            >
              {children}
            </DefaultSessionEffects>
          </DefaultDomainProviders>
        </GraphProvider>
      </SuggestedActionsSubscriber>
    </SuggestedActionsComposer>
  );
}

DefaultProviders.displayName = 'DefaultProviders';

export default memo(DefaultProviders);
export { defaultProvidersPropsSchema, type DefaultProvidersProps };
