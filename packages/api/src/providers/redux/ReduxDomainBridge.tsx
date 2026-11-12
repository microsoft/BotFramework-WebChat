import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import {
  clearSuggestedActions,
  dismissNotification,
  emitTypingIndicator,
  markActivity,
  muteVoiceRecording,
  postActivity,
  postVoiceActivity,
  registerVoiceHandler,
  sendEvent,
  sendFiles,
  sendMessage,
  sendMessageBack,
  sendPostBack,
  setDictateInterims,
  setDictateState,
  setNotification,
  setSendBox,
  setSendBoxAttachments,
  setSendTimeout,
  setVoiceState,
  startDictate,
  startSpeakingActivity,
  startVoiceRecording,
  stopDictate,
  stopSpeakingActivity,
  stopVoiceRecording,
  submitSendBox,
  unmuteVoiceRecording,
  unregisterVoiceHandler,
  type VoiceHandler,
  type VoiceState,
  type WebChatActivity
} from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import { useWebChatReduxContext, type WebChatReduxStore } from '../../hooks/internal/WebChatReduxContext';
import ChatOperationsContext, {
  type ChatOperationsContextType
} from '../../hooks/internal/domains/ChatOperationsContext';
import ConnectionSlices from '../../hooks/internal/domains/ConnectionSlices';
import NotificationsContext, { type NotificationsContextType } from '../../hooks/internal/domains/NotificationsContext';
import SendBoxContext, { type SendBoxContextType } from '../../hooks/internal/domains/SendBoxContext';
import { type Source } from '../../hooks/internal/domains/Source';
import useSourceValue from '../../hooks/internal/domains/useSourceValue';
import SpeechContext, { type SpeechContextType } from '../../hooks/internal/domains/SpeechContext';
import VoiceContext, { type VoiceContextType } from '../../hooks/internal/domains/VoiceContext';
import randomId from '../../utils/randomId';

const reduxDomainBridgePropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type ReduxDomainBridgeProps = InferInput<typeof reduxDomainBridgePropsSchema>;

type ReduxState = ReturnType<WebChatReduxStore['getState']>;

// One slice of the store, through the batched subscription of <WebChatReduxProvider>.
function createSource<T>(
  store: WebChatReduxStore,
  subscribe: Source<T>['subscribe'],
  select: (state: ReduxState) => T
): Source<T> {
  return Object.freeze({ get: () => select(store.getState()), subscribe });
}

// Same as the dispatchers <Composer> hoisted from action creators: passes every argument, returns what `dispatch()` returns.
function bindDispatch<TArgs extends unknown[]>(
  dispatch: WebChatReduxStore['dispatch'],
  actionCreator: (...args: TArgs) => Parameters<WebChatReduxStore['dispatch']>[0]
  // `any`, as the dispatchers <Composer> hoisted before: WebChatAPIContextType says postActivity() returns an observable.
): (...args: TArgs) => any {
  return (...args) => dispatch(actionCreator(...args));
}

/**
 * Provides the domain contexts over the Redux store: the slice contexts from one subscription to the store, the other
 * domain contexts with one source per slice; each setter dispatches an action.
 */
function ReduxDomainBridge(props: ReduxDomainBridgeProps) {
  const { children } = validateProps(reduxDomainBridgePropsSchema, props);
  const { store, subscribe } = useWebChatReduxContext();
  const { dispatch } = store;

  const chatOperations = useMemo<ChatOperationsContextType>(
    () =>
      Object.freeze({
        clearSuggestedActions: bindDispatch(dispatch, clearSuggestedActions),
        dispatch,
        markActivity: bindDispatch(dispatch, markActivity),
        postActivity: bindDispatch(dispatch, postActivity),
        sendEvent: bindDispatch(dispatch, sendEvent),
        sendFiles: bindDispatch(dispatch, sendFiles),
        sendMessage: bindDispatch(dispatch, sendMessage),
        sendMessageBack: bindDispatch(dispatch, sendMessageBack),
        sendPostBack: bindDispatch(dispatch, sendPostBack),
        setSendTimeout: bindDispatch(dispatch, setSendTimeout)
      }),
    [dispatch]
  );

  // One subscription for the slices: the bridge re-renders on every change of the store, and each slice context
  // propagates only when its slice changed.
  const state = useSourceValue(
    useMemo<Source<ReduxState>>(() => Object.freeze({ get: () => store.getState(), subscribe }), [store, subscribe])
  );

  const notifications = useMemo<NotificationsContextType>(
    () =>
      Object.freeze({
        dismissNotification: bindDispatch(dispatch, dismissNotification),
        setNotification: bindDispatch(dispatch, setNotification)
      }),
    [dispatch]
  );

  const sendBox = useMemo<SendBoxContextType>(
    () =>
      Object.freeze({
        attachments: createSource(store, subscribe, ({ sendBoxAttachments }) => sendBoxAttachments),
        emitTypingIndicator: bindDispatch(dispatch, emitTypingIndicator),
        sendTypingIndicator: createSource(store, subscribe, ({ sendTypingIndicator }) => sendTypingIndicator),
        setAttachments: bindDispatch(dispatch, setSendBoxAttachments),
        setValue: bindDispatch(dispatch, setSendBox),
        submit: bindDispatch(dispatch, submitSendBox),
        value: createSource(store, subscribe, ({ sendBoxValue }) => sendBoxValue)
      }),
    [dispatch, store, subscribe]
  );

  const speech = useMemo<SpeechContextType>(
    () =>
      Object.freeze({
        dictateInterims: createSource(store, subscribe, ({ dictateInterims }) => dictateInterims),
        dictateState: createSource(store, subscribe, ({ dictateState }) => dictateState),
        setDictateInterims: bindDispatch(dispatch, setDictateInterims),
        setDictateState: bindDispatch(dispatch, setDictateState),
        shouldSpeakIncomingActivity: createSource(
          store,
          subscribe,
          ({ shouldSpeakIncomingActivity }) => shouldSpeakIncomingActivity
        ),
        startDictate: bindDispatch(dispatch, startDictate),
        startSpeakingActivity: bindDispatch(dispatch, startSpeakingActivity),
        stopDictate: bindDispatch(dispatch, stopDictate),
        stopSpeakingActivity: bindDispatch(dispatch, stopSpeakingActivity)
      }),
    [dispatch, store, subscribe]
  );

  const voice = useMemo<VoiceContextType>(
    () =>
      Object.freeze({
        microphoneMuted: createSource(store, subscribe, ({ voice }) => voice.microphoneMuted),
        postVoiceActivity: (activity: WebChatActivity) => {
          dispatch(postVoiceActivity(activity));
        },
        registerVoiceHandler: (voiceHandler: VoiceHandler) => {
          const id = randomId();
          dispatch(registerVoiceHandler(id, voiceHandler));
          return () => {
            dispatch(unregisterVoiceHandler(id));
          };
        },
        setMuted: (muted: boolean) => {
          dispatch(muted ? muteVoiceRecording() : unmuteVoiceRecording());
        },
        setVoiceState: (state: VoiceState) => {
          dispatch(setVoiceState(state));
        },
        startVoice: () => {
          dispatch(startVoiceRecording());
        },
        stopVoice: () => {
          dispatch(stopVoiceRecording());
        },
        voiceHandlers: createSource(store, subscribe, ({ voice }) => voice.voiceHandlers),
        voiceState: createSource(store, subscribe, ({ voice }) => voice.voiceState)
      }),
    [dispatch, store, subscribe]
  );

  return (
    <ChatOperationsContext.Provider value={chatOperations}>
      <NotificationsContext.Provider value={notifications}>
        <SendBoxContext.Provider value={sendBox}>
          <SpeechContext.Provider value={speech}>
            <VoiceContext.Provider value={voice}>
              <ConnectionSlices
                connectivityStatus={state.connectivityStatus}
                notifications={state.notifications}
                referenceGrammarID={state.referenceGrammarID}
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

ReduxDomainBridge.displayName = 'ReduxDomainBridge';

export default memo(ReduxDomainBridge);
export { reduxDomainBridgePropsSchema, type ReduxDomainBridgeProps };
