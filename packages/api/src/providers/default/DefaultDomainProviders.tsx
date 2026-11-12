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
  type VoiceHandler
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
import ConnectionSlices from '../../hooks/internal/domains/ConnectionSlices';
import NotificationsContext, { type NotificationsContextType } from '../../hooks/internal/domains/NotificationsContext';
import SendBoxContext, { type SendBoxContextType } from '../../hooks/internal/domains/SendBoxContext';
import SpeechContext, { type SpeechContextType } from '../../hooks/internal/domains/SpeechContext';
import useSourceValue from '../../hooks/internal/domains/useSourceValue';
import VoiceContext, { type VoiceContextType } from '../../hooks/internal/domains/VoiceContext';
import randomId from '../../utils/randomId';
import { type Notification } from '../../types/Notification';

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
 * An operation of a domain context: builds the action with its creator (which validates the arguments, and throws as in
 * Redux mode), runs it on the services, and returns the action, as `dispatch()` does in Redux mode.
 */
function operation<TArgs extends unknown[], TAction>(
  createAction: (...args: TArgs) => TAction,
  run: (action: TAction) => void
): (...args: TArgs) => TAction {
  return (...args) => {
    const action = createAction(...args);

    run(action);

    return action;
  };
}

/**
 * The domain contexts of the default providers, from the services: connectivity, notifications, chat operations, the
 * send box, speech and voice.
 *
 * The operations build their payloads with the action creators of the same names, and return the action (see
 * `operation()`). The voice operations are those of the services, and return nothing, as in Redux mode.
 */
function DefaultDomainProviders(props: DefaultDomainProvidersProps) {
  const { children, connection, notifications, outgoing, sendBox, speech, suggestedActions, voice } = validateProps(
    defaultDomainProvidersPropsSchema,
    props
  );

  const chatOperationsContext = useMemo<ChatOperationsContextType>(
    () =>
      Object.freeze({
        // The array of a clear, so clearing again does not re-render, as in Redux mode.
        clearSuggestedActions: operation(clearSuggestedActions, () =>
          suggestedActions.emit(CLEARED_SUGGESTED_ACTIONS, undefined)
        ),
        dispatch: createCompatibilityDispatch({ outgoing }),
        // Through speech: every mark may start the dictation, as MARK_ACTIVITY goes through its saga.
        markActivity: operation(markActivity, ({ payload: { activityID, name, value } }) =>
          speech.markActivity({ id: activityID }, name, value)
        ),
        postActivity: operation(postActivity, ({ meta, payload }) =>
          outgoing.postActivity(payload.activity, meta.method)
        ),
        sendEvent: operation(sendEvent, ({ payload }) => outgoing.sendEvent(payload)),
        sendFiles: operation(sendFiles, ({ payload }) => outgoing.sendFiles(payload)),
        sendMessage: operation(sendMessage, ({ payload }) => outgoing.sendMessage(payload)),
        sendMessageBack: operation(sendMessageBack, ({ payload }) => outgoing.sendMessageBack(payload)),
        sendPostBack: operation(sendPostBack, ({ payload }) => outgoing.sendPostBack(payload)),
        setSendTimeout: operation(setSendTimeout, ({ payload }) => outgoing.setSendTimeout(payload.sendTimeout))
      }) as unknown as ChatOperationsContextType,
    [outgoing, speech, suggestedActions]
  );

  // The slices of the connection group, from the sources of the services, until the services become reducer groups.
  const connectivityStatus = useSourceValue(connection.connectivityStatus);
  // Keyed by ID, as the `notifications` slice of the Redux store.
  const notificationsValue = useSourceValue(notifications.notifications) as unknown as Notification[];
  // As the Redux store: `null` until Direct Line has a reference grammar ID.
  const referenceGrammarID = useSourceValue(connection.referenceGrammarID) as string;

  const notificationsContext = useMemo<NotificationsContextType>(
    () =>
      Object.freeze({
        dismissNotification: notifications.dismissNotification,
        setNotification: notifications.setNotification
      }),
    [notifications]
  );

  const sendBoxContext = useMemo<SendBoxContextType>(
    () =>
      Object.freeze({
        attachments: sendBox.attachments,
        emitTypingIndicator: operation(emitTypingIndicator, () => outgoing.emitTypingIndicator()),
        sendTypingIndicator: sendBox.sendTypingIndicator,
        setAttachments: operation(setSendBoxAttachments, ({ payload }) => sendBox.setAttachments(payload.attachments)),
        setValue: operation(setSendBox, ({ payload }) => sendBox.setValue(payload.text)),
        submit: operation(submitSendBox, ({ payload }) => sendBox.submit(payload)),
        value: sendBox.value
      }) as unknown as SendBoxContextType,
    [outgoing, sendBox]
  );

  const speechContext = useMemo<SpeechContextType>(
    () =>
      Object.freeze({
        dictateInterims: speech.dictateInterims as SpeechContextType['dictateInterims'],
        dictateState: speech.dictateState,
        setDictateInterims: operation(setDictateInterims, ({ payload }) =>
          speech.setDictateInterims(payload.dictateInterims)
        ),
        setDictateState: operation(setDictateState, ({ payload }) => speech.setDictateState(payload.dictateState)),
        shouldSpeakIncomingActivity: speech.shouldSpeakIncomingActivity,
        startDictate: operation(startDictate, () => speech.startDictate()),
        startSpeakingActivity: operation(startSpeakingActivity, () => speech.startSpeakingActivity()),
        stopDictate: operation(stopDictate, () => speech.stopDictate()),
        stopSpeakingActivity: operation(stopSpeakingActivity, () => speech.stopSpeakingActivity())
      }) as unknown as SpeechContextType,
    [speech]
  );

  const voiceContext = useMemo<VoiceContextType>(
    () =>
      Object.freeze({
        microphoneMuted: voice.microphoneMuted,
        postVoiceActivity: outgoing.postVoiceActivity,
        // A new ID for each handler, as in Redux mode.
        registerVoiceHandler: (voiceHandler: VoiceHandler) => voice.registerVoiceHandler(randomId(), voiceHandler),
        setMuted: voice.setMuted,
        setVoiceState: voice.setVoiceState,
        startVoice: voice.startVoice,
        stopVoice: voice.stopVoice,
        voiceHandlers: voice.voiceHandlers,
        voiceState: voice.voiceState
      }),
    [outgoing, voice]
  );

  return (
    <ChatOperationsContext.Provider value={chatOperationsContext}>
      <NotificationsContext.Provider value={notificationsContext}>
        <SendBoxContext.Provider value={sendBoxContext}>
          <SpeechContext.Provider value={speechContext}>
            <VoiceContext.Provider value={voiceContext}>
              <ConnectionSlices
                connectivityStatus={connectivityStatus}
                notifications={notificationsValue}
                referenceGrammarID={referenceGrammarID}
              >
                {children}
              </ConnectionSlices>
            </VoiceContext.Provider>
          </SpeechContext.Provider>
        </SendBoxContext.Provider>
      </NotificationsContext.Provider>
    </ChatOperationsContext.Provider>
  );
}

DefaultDomainProviders.displayName = 'DefaultDomainProviders';

export default memo(DefaultDomainProviders);
export { defaultDomainProvidersPropsSchema, type DefaultDomainProvidersProps };
