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
import SendBoxSlices from '../../hooks/internal/domains/SendBoxSlices';
import { type Source } from '../../hooks/internal/domains/Source';
import useSourceValue from '../../hooks/internal/domains/useSourceValue';
import SpeechContext, { type SpeechContextType } from '../../hooks/internal/domains/SpeechContext';
import SpeechSlices from '../../hooks/internal/domains/SpeechSlices';
import VoiceContext, { type VoiceContextType } from '../../hooks/internal/domains/VoiceContext';
import VoiceSlices from '../../hooks/internal/domains/VoiceSlices';
import randomId from '../../utils/randomId';

const reduxDomainBridgePropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type ReduxDomainBridgeProps = InferInput<typeof reduxDomainBridgePropsSchema>;

type ReduxState = ReturnType<WebChatReduxStore['getState']>;

// The slices of the slice contexts.
function selectSlices(state: ReduxState) {
  return {
    connectivityStatus: state.connectivityStatus,
    dictateInterims: state.dictateInterims,
    dictateState: state.dictateState,
    microphoneMuted: state.voice.microphoneMuted,
    notifications: state.notifications,
    referenceGrammarID: state.referenceGrammarID,
    sendBoxAttachments: state.sendBoxAttachments,
    sendBoxValue: state.sendBoxValue,
    sendTypingIndicator: state.sendTypingIndicator,
    shouldSpeakIncomingActivity: state.shouldSpeakIncomingActivity,
    voiceHandlers: state.voice.voiceHandlers,
    voiceState: state.voice.voiceState
  };
}

type Slices = ReturnType<typeof selectSlices>;

function shallowEqual(x: Slices, y: Slices): boolean {
  // eslint-disable-next-line security/detect-object-injection
  return (Object.keys(x) as (keyof Slices)[]).every(key => Object.is(x[key], y[key]));
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
 * Provides the domain contexts over the Redux store: the slice contexts from one subscription to the store (through
 * the batched subscription of `<WebChatReduxProvider>`); each setter dispatches an action.
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

  // One subscription for the slices: the bridge re-renders only when one of them changed (as `useSelector()` of each
  // slice did), so an action that changes another part of the store (e.g. the suggested actions mirrored during render)
  // does not re-render it. Each slice context then propagates only when its slice changed.
  const state = useSourceValue(
    useMemo<Source<Slices>>(
      () => Object.freeze({ get: () => selectSlices(store.getState()), subscribe }),
      [store, subscribe]
    ),
    shallowEqual
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
        emitTypingIndicator: bindDispatch(dispatch, emitTypingIndicator),
        setAttachments: bindDispatch(dispatch, setSendBoxAttachments),
        setValue: bindDispatch(dispatch, setSendBox),
        submit: bindDispatch(dispatch, submitSendBox)
      }),
    [dispatch]
  );

  const speech = useMemo<SpeechContextType>(
    () =>
      Object.freeze({
        setDictateInterims: bindDispatch(dispatch, setDictateInterims),
        setDictateState: bindDispatch(dispatch, setDictateState),
        startDictate: bindDispatch(dispatch, startDictate),
        startSpeakingActivity: bindDispatch(dispatch, startSpeakingActivity),
        stopDictate: bindDispatch(dispatch, stopDictate),
        stopSpeakingActivity: bindDispatch(dispatch, stopSpeakingActivity)
      }),
    [dispatch]
  );

  const voice = useMemo<VoiceContextType>(
    () =>
      Object.freeze({
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
        }
      }),
    [dispatch]
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
                <SendBoxSlices
                  sendBoxAttachments={state.sendBoxAttachments}
                  sendBoxValue={state.sendBoxValue}
                  sendTypingIndicator={state.sendTypingIndicator}
                >
                  <SpeechSlices
                    dictateInterims={state.dictateInterims}
                    dictateState={state.dictateState}
                    shouldSpeakIncomingActivity={state.shouldSpeakIncomingActivity}
                  >
                    <VoiceSlices
                      microphoneMuted={state.microphoneMuted}
                      voiceHandlers={state.voiceHandlers}
                      voiceState={state.voiceState}
                    >
                      {children}
                    </VoiceSlices>
                  </SpeechSlices>
                </SendBoxSlices>
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
