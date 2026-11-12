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
import React, { useMemo, type ReactNode } from 'react';

import randomId from '../../../utils/randomId';
import ChatOperationsContext, { type ChatOperationsContextType } from './ChatOperationsContext';
import NotificationsContext, { type NotificationsContextType } from './NotificationsContext';
import SendBoxContext, { type SendBoxContextType } from './SendBoxContext';
import SpeechContext, { type SpeechContextType } from './SpeechContext';
import VoiceContext, { type VoiceContextType } from './VoiceContext';

type Dispatch = (action: any) => any;

// Same as the dispatchers <Composer> hoisted from action creators: passes every argument, returns what `dispatch()` returns.
function bindDispatch<TArgs extends unknown[]>(
  dispatch: Dispatch,
  actionCreator: (...args: TArgs) => unknown
  // `any`, as the dispatchers <Composer> hoisted before: WebChatAPIContextType says postActivity() returns an observable.
): (...args: TArgs) => any {
  return (...args) => dispatch(actionCreator(...args));
}

type DomainOperationsProps = {
  readonly children?: ReactNode | undefined;
  /** `dispatch()` of the Redux store, or of the default engine: also the `dispatch()` given to card action middleware. */
  readonly dispatch: Dispatch;
};

/**
 * The setters of the domain contexts (chat operations, notifications, send box, speech, voice): each dispatches the
 * action of its action creator. Both provider sets render it, with their `dispatch()`.
 */
function DomainOperations({ children, dispatch }: DomainOperationsProps) {
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
          // A new ID for each handler.
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
            <VoiceContext.Provider value={voice}>{children}</VoiceContext.Provider>
          </SpeechContext.Provider>
        </SendBoxContext.Provider>
      </NotificationsContext.Provider>
    </ChatOperationsContext.Provider>
  );
}

DomainOperations.displayName = 'DomainOperations';

export default DomainOperations;
export { type DomainOperationsProps };
