import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { CLEARED_SUGGESTED_ACTIONS } from '@msinternal/botframework-webchat-redux-store';
import {
  clearSuggestedActions,
  emitTypingIndicator,
  markActivity,
  postActivity,
  sendEvent,
  sendFiles,
  sendMessage,
  sendMessageBack,
  sendPostBack,
  setSendBox,
  setSendBoxAttachments,
  setSendTimeout,
  submitSendBox
} from 'botframework-webchat-core';
import {
  createCompatibilityDispatch,
  type ActivitiesStore,
  type ConnectionService,
  type NotificationsCell,
  type OutgoingService,
  type SendBoxService,
  type SuggestedActionsEmitter
} from 'botframework-webchat-core/internal.js';
import React, { memo, useMemo } from 'react';
import { custom, function_, is, object, optional, pipe, readonly, type InferInput } from 'valibot';

import ChatOperationsContext, {
  type ChatOperationsContextType
} from '../../hooks/internal/domains/ChatOperationsContext';
import ConnectivityContext, { type ConnectivityContextType } from '../../hooks/internal/domains/ConnectivityContext';
import NotificationsContext, { type NotificationsContextType } from '../../hooks/internal/domains/NotificationsContext';
import SendBoxContext, { type SendBoxContextType } from '../../hooks/internal/domains/SendBoxContext';
import DefaultDomainPlaceholders from './DefaultDomainPlaceholders';

const defaultDomainProvidersPropsSchema = pipe(
  object({
    activitiesStore: custom<Pick<ActivitiesStore, 'markActivity'>>(value =>
      is(object({ markActivity: function_() }), value)
    ),
    children: optional(reactNode()),
    connection: custom<Pick<ConnectionService, 'connectivityStatus' | 'referenceGrammarID'>>(value =>
      is(object({ connectivityStatus: object({}), referenceGrammarID: object({}) }), value)
    ),
    notifications: custom<NotificationsCell>(value =>
      is(object({ dismissNotification: function_(), notifications: object({}), setNotification: function_() }), value)
    ),
    outgoing: custom<OutgoingService>(value =>
      is(object({ postActivity: function_(), whileOnline: function_() }), value)
    ),
    sendBox: custom<SendBoxService>(value => is(object({ setValue: function_(), submit: function_() }), value)),
    suggestedActions: custom<SuggestedActionsEmitter>(value => is(object({ emit: function_() }), value))
  }),
  readonly()
);

type DefaultDomainProvidersProps = InferInput<typeof defaultDomainProvidersPropsSchema>;

/**
 * The domain contexts of the default providers: connectivity, notifications, chat operations and the send box from the
 * services, placeholders for the domains not built yet (speech and voice).
 *
 * The operations build their payloads with the action creators of the same names (which validate them, and throw as in
 * Redux mode), and return the action, as `dispatch()` does in Redux mode.
 */
function DefaultDomainProviders(props: DefaultDomainProvidersProps) {
  const { activitiesStore, children, connection, notifications, outgoing, sendBox, suggestedActions } = validateProps(
    defaultDomainProvidersPropsSchema,
    props
  );

  const chatOperationsContext = useMemo<ChatOperationsContextType>(
    () =>
      Object.freeze({
        clearSuggestedActions: () => {
          const action = clearSuggestedActions();

          // The array of a clear, so clearing again does not re-render, as in Redux mode.
          suggestedActions.emit(CLEARED_SUGGESTED_ACTIONS, undefined);

          return action;
        },
        dispatch: createCompatibilityDispatch({ outgoing }),
        markActivity: (...args: Parameters<typeof markActivity>) => {
          const action = markActivity(...args);
          const {
            payload: { activityID, name, value }
          } = action;

          activitiesStore.markActivity(activityID, name, value);

          return action;
        },
        postActivity: (...args: Parameters<typeof postActivity>) => {
          const action = postActivity(...args);

          outgoing.postActivity(action.payload.activity, action.meta.method);

          return action;
        },
        sendEvent: (...args: Parameters<typeof sendEvent>) => {
          const action = sendEvent(...args);

          outgoing.sendEvent(action.payload);

          return action;
        },
        sendFiles: (...args: Parameters<typeof sendFiles>) => {
          const action = sendFiles(...args);

          outgoing.sendFiles(action.payload);

          return action;
        },
        sendMessage: (...args: Parameters<typeof sendMessage>) => {
          const action = sendMessage(...args);

          outgoing.sendMessage(action.payload);

          return action;
        },
        sendMessageBack: (...args: Parameters<typeof sendMessageBack>) => {
          const action = sendMessageBack(...args);

          outgoing.sendMessageBack(action.payload);

          return action;
        },
        sendPostBack: (...args: Parameters<typeof sendPostBack>) => {
          const action = sendPostBack(...args);

          outgoing.sendPostBack(action.payload);

          return action;
        },
        setSendTimeout: (...args: Parameters<typeof setSendTimeout>) => {
          const action = setSendTimeout(...args);

          outgoing.setSendTimeout(action.payload.sendTimeout);

          return action;
        }
      }) as unknown as ChatOperationsContextType,
    [activitiesStore, outgoing, suggestedActions]
  );

  const connectivityContext = useMemo<ConnectivityContextType>(
    () =>
      Object.freeze({
        connectivityStatus: connection.connectivityStatus,
        // As the Redux store: `null` until Direct Line has a reference grammar ID.
        referenceGrammarID: connection.referenceGrammarID as ConnectivityContextType['referenceGrammarID']
      }),
    [connection]
  );

  const notificationsContext = useMemo<NotificationsContextType>(
    () =>
      Object.freeze({
        dismissNotification: notifications.dismissNotification,
        // Keyed by ID, as the `notifications` slice of the Redux store.
        notifications: notifications.notifications as unknown as NotificationsContextType['notifications'],
        setNotification: notifications.setNotification
      }),
    [notifications]
  );

  const sendBoxContext = useMemo<SendBoxContextType>(
    () =>
      Object.freeze({
        attachments: sendBox.attachments,
        emitTypingIndicator: () => {
          const action = emitTypingIndicator();

          outgoing.emitTypingIndicator();

          return action;
        },
        sendTypingIndicator: sendBox.sendTypingIndicator,
        setAttachments: (...args: Parameters<typeof setSendBoxAttachments>) => {
          const action = setSendBoxAttachments(...args);

          sendBox.setAttachments(action.payload.attachments);

          return action;
        },
        setValue: (...args: Parameters<typeof setSendBox>) => {
          const action = setSendBox(...args);

          sendBox.setValue(action.payload.text);

          return action;
        },
        submit: (...args: Parameters<typeof submitSendBox>) => {
          const action = submitSendBox(...args);

          sendBox.submit(action.payload);

          return action;
        },
        value: sendBox.value
      }) as unknown as SendBoxContextType,
    [outgoing, sendBox]
  );

  return (
    <ChatOperationsContext.Provider value={chatOperationsContext}>
      <ConnectivityContext.Provider value={connectivityContext}>
        <NotificationsContext.Provider value={notificationsContext}>
          <SendBoxContext.Provider value={sendBoxContext}>
            <DefaultDomainPlaceholders>{children}</DefaultDomainPlaceholders>
          </SendBoxContext.Provider>
        </NotificationsContext.Provider>
      </ConnectivityContext.Provider>
    </ChatOperationsContext.Provider>
  );
}

DefaultDomainProviders.displayName = 'DefaultDomainProviders';

export default memo(DefaultDomainProviders);
export { defaultDomainProvidersPropsSchema, type DefaultDomainProvidersProps };
