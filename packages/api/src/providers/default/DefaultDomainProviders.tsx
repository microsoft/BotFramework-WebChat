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
  setDictateInterims,
  setDictateState,
  setSendBox,
  setSendBoxAttachments,
  setSendTimeout,
  startDictate,
  startSpeakingActivity,
  stopDictate,
  stopSpeakingActivity,
  submitSendBox,
  type VoiceHandler,
  type VoiceState,
  type WebChatActivity
} from 'botframework-webchat-core';
import {
  createCompatibilityDispatch,
  type ConnectionService,
  type NotificationsCell,
  type OutgoingService,
  type SendBoxService,
  type SpeechService,
  type SuggestedActionsEmitter,
  type VoiceService
} from 'botframework-webchat-core/internal.js';
import React, { memo, useMemo } from 'react';
import { custom, function_, is, object, optional, pipe, readonly, type InferInput } from 'valibot';

import ChatOperationsContext, {
  type ChatOperationsContextType
} from '../../hooks/internal/domains/ChatOperationsContext';
import ConnectivityContext, { type ConnectivityContextType } from '../../hooks/internal/domains/ConnectivityContext';
import NotificationsContext, { type NotificationsContextType } from '../../hooks/internal/domains/NotificationsContext';
import SendBoxContext, { type SendBoxContextType } from '../../hooks/internal/domains/SendBoxContext';
import SpeechContext, { type SpeechContextType } from '../../hooks/internal/domains/SpeechContext';
import VoiceContext, { type VoiceContextType } from '../../hooks/internal/domains/VoiceContext';
import randomId from '../../utils/randomId';

const defaultDomainProvidersPropsSchema = pipe(
  object({
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
    speech: custom<SpeechService>(value =>
      is(object({ markActivity: function_(), setDictateState: function_() }), value)
    ),
    suggestedActions: custom<SuggestedActionsEmitter>(value => is(object({ emit: function_() }), value)),
    voice: custom<VoiceService>(value =>
      is(object({ registerVoiceHandler: function_(), startVoice: function_() }), value)
    )
  }),
  readonly()
);

type DefaultDomainProvidersProps = InferInput<typeof defaultDomainProvidersPropsSchema>;

/**
 * The domain contexts of the default providers, from the services: connectivity, notifications, chat operations, the
 * send box, speech and voice.
 *
 * The operations build their payloads with the action creators of the same names (which validate them, and throw as in
 * Redux mode), and return the action, as `dispatch()` does in Redux mode. The voice operations return nothing, as in
 * Redux mode.
 */
function DefaultDomainProviders(props: DefaultDomainProvidersProps) {
  const { children, connection, notifications, outgoing, sendBox, speech, suggestedActions, voice } = validateProps(
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

          // Through speech: every mark may start the dictation, as MARK_ACTIVITY goes through its saga.
          speech.markActivity({ id: activityID }, name, value);

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
    [outgoing, speech, suggestedActions]
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

  const speechContext = useMemo<SpeechContextType>(
    () =>
      Object.freeze({
        dictateInterims: speech.dictateInterims as SpeechContextType['dictateInterims'],
        dictateState: speech.dictateState,
        setDictateInterims: (...args: Parameters<typeof setDictateInterims>) => {
          const action = setDictateInterims(...args);

          speech.setDictateInterims(action.payload.dictateInterims);

          return action;
        },
        setDictateState: (...args: Parameters<typeof setDictateState>) => {
          const action = setDictateState(...args);

          speech.setDictateState(action.payload.dictateState);

          return action;
        },
        shouldSpeakIncomingActivity: speech.shouldSpeakIncomingActivity,
        startDictate: () => {
          speech.startDictate();

          return startDictate();
        },
        startSpeakingActivity: () => {
          speech.startSpeakingActivity();

          return startSpeakingActivity();
        },
        stopDictate: () => {
          speech.stopDictate();

          return stopDictate();
        },
        stopSpeakingActivity: () => {
          speech.stopSpeakingActivity();

          return stopSpeakingActivity();
        }
      }) as unknown as SpeechContextType,
    [speech]
  );

  const voiceContext = useMemo<VoiceContextType>(
    () =>
      Object.freeze({
        microphoneMuted: voice.microphoneMuted,
        postVoiceActivity: (activity: WebChatActivity) => {
          outgoing.postVoiceActivity(activity);
        },
        // A new ID for each handler, as in Redux mode.
        registerVoiceHandler: (voiceHandler: VoiceHandler) => voice.registerVoiceHandler(randomId(), voiceHandler),
        setMuted: (muted: boolean) => {
          voice.setMuted(muted);
        },
        setVoiceState: (voiceState: VoiceState) => {
          voice.setVoiceState(voiceState);
        },
        startVoice: () => {
          voice.startVoice();
        },
        stopVoice: () => {
          voice.stopVoice();
        },
        voiceHandlers: voice.voiceHandlers,
        voiceState: voice.voiceState
      }),
    [outgoing, voice]
  );

  return (
    <ChatOperationsContext.Provider value={chatOperationsContext}>
      <ConnectivityContext.Provider value={connectivityContext}>
        <NotificationsContext.Provider value={notificationsContext}>
          <SendBoxContext.Provider value={sendBoxContext}>
            <SpeechContext.Provider value={speechContext}>
              <VoiceContext.Provider value={voiceContext}>{children}</VoiceContext.Provider>
            </SpeechContext.Provider>
          </SendBoxContext.Provider>
        </NotificationsContext.Provider>
      </ConnectivityContext.Provider>
    </ChatOperationsContext.Provider>
  );
}

DefaultDomainProviders.displayName = 'DefaultDomainProviders';

export default memo(DefaultDomainProviders);
export { defaultDomainProvidersPropsSchema, type DefaultDomainProvidersProps };
