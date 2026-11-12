/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { GraphProvider } from '@msinternal/botframework-webchat-api-graph';
import { render } from '@testing-library/react';
import { sendMessage } from 'botframework-webchat-core';
import React, { type ReactNode } from 'react';

import ActivityAcknowledgementComposer from '../providers/ActivityAcknowledgement/ActivityAcknowledgementComposer';
import ActivityKeyerComposer from '../providers/ActivityKeyer/ActivityKeyerComposer';
import PonyfillComposer from '../providers/Ponyfill/PonyfillComposer';
import StyleOptionsComposer from '../providers/StyleOptions/StyleOptionsComposer';
import { ComposerCore } from './Composer';
import { type WebChatAPIContextType } from './internal/WebChatAPIContext';
import ChatOperationsContext, { type ChatOperationsContextType } from './internal/domains/ChatOperationsContext';
import ConnectionSlices from './internal/domains/ConnectionSlices';
import NotificationsContext, { type NotificationsContextType } from './internal/domains/NotificationsContext';
import SendBoxContext, { type SendBoxContextType } from './internal/domains/SendBoxContext';
import SendBoxSlices from './internal/domains/SendBoxSlices';
import { type Source } from './internal/domains/Source';
import SpeechContext, { type SpeechContextType } from './internal/domains/SpeechContext';
import SpeechSlices from './internal/domains/SpeechSlices';
import VoiceContext, { type VoiceContextType } from './internal/domains/VoiceContext';
import useConnectivityStatus from './useConnectivityStatus';
import useSendBoxValue from './useSendBoxValue';

// <ComposerCore> under stub domain contexts and no Redux store: it reads the contexts only.

const unsubscribe = () => undefined;

const constant = <T,>(value: T): Source<T> => Object.freeze({ get: () => value, subscribe: () => unsubscribe });

function createStubs() {
  const chatOperations: ChatOperationsContextType = Object.freeze({
    clearSuggestedActions: jest.fn(),
    dispatch: jest.fn(),
    markActivity: jest.fn(),
    postActivity: jest.fn(),
    sendEvent: jest.fn(),
    sendFiles: jest.fn(),
    sendMessage: jest.fn(),
    sendMessageBack: jest.fn(),
    sendPostBack: jest.fn(),
    setSendTimeout: jest.fn()
  });

  const notifications: NotificationsContextType = Object.freeze({
    dismissNotification: jest.fn(),
    setNotification: jest.fn()
  });

  const sendBox: SendBoxContextType = Object.freeze({
    emitTypingIndicator: jest.fn(),
    setAttachments: jest.fn(),
    setValue: jest.fn(),
    submit: jest.fn()
  });

  const speech: SpeechContextType = Object.freeze({
    setDictateInterims: jest.fn(),
    setDictateState: jest.fn(),
    startDictate: jest.fn(),
    startSpeakingActivity: jest.fn(),
    stopDictate: jest.fn(),
    stopSpeakingActivity: jest.fn()
  });

  const stopAllAudio = jest.fn();

  const voice: VoiceContextType = Object.freeze({
    microphoneMuted: constant(false),
    postVoiceActivity: jest.fn(),
    registerVoiceHandler: jest.fn(),
    setMuted: jest.fn(),
    setVoiceState: jest.fn(),
    startVoice: jest.fn(),
    stopVoice: jest.fn(),
    voiceHandlers: constant(new Map([['h-1', { queueAudio: jest.fn(), stopAllAudio } as any]])),
    voiceState: constant('idle' as const)
  });

  return { chatOperations, notifications, sendBox, speech, stopAllAudio, voice };
}

function renderComposerCore(
  stubs: ReturnType<typeof createStubs>,
  children: (context: WebChatAPIContextType) => ReactNode
) {
  const directLine = {
    activity$: { subscribe: jest.fn() },
    connectionStatus$: { subscribe: jest.fn() },
    postActivity: jest.fn()
  };

  // No activities: a store-like object for <GraphProvider>, which is not a Redux store.
  const activities = Object.freeze({ getState: () => ({ activities: [] }), subscribe: () => unsubscribe });

  return render(
    <PonyfillComposer>
      <StyleOptionsComposer>
        <GraphProvider store={activities as any}>
          <ChatOperationsContext.Provider value={stubs.chatOperations}>
            <ConnectionSlices connectivityStatus="connected" notifications={[]} referenceGrammarID="grammar">
              <SendBoxSlices sendBoxAttachments={[]} sendBoxValue="Hello" sendTypingIndicator={false}>
                <SpeechSlices dictateInterims={undefined} dictateState={0} shouldSpeakIncomingActivity={false}>
                  <NotificationsContext.Provider value={stubs.notifications}>
                    <SendBoxContext.Provider value={stubs.sendBox}>
                      <SpeechContext.Provider value={stubs.speech}>
                        <VoiceContext.Provider value={stubs.voice}>
                          <ActivityKeyerComposer>
                            <ActivityAcknowledgementComposer>
                              <ComposerCore directLine={directLine as any}>{children}</ComposerCore>
                            </ActivityAcknowledgementComposer>
                          </ActivityKeyerComposer>
                        </VoiceContext.Provider>
                      </SpeechContext.Provider>
                    </SendBoxContext.Provider>
                  </NotificationsContext.Provider>
                </SpeechSlices>
              </SendBoxSlices>
            </ConnectionSlices>
          </ChatOperationsContext.Provider>
        </GraphProvider>
      </StyleOptionsComposer>
    </PonyfillComposer>
  );
}

describe('<ComposerCore> under stub domain contexts, without a Redux store', () => {
  test('should fill WebChatAPIContext with the setters of the domain contexts', () => {
    const stubs = createStubs();
    let context: WebChatAPIContextType;

    renderComposerCore(stubs, value => {
      context = value;

      return null;
    });

    expect(context).toEqual(
      expect.objectContaining({
        clearSuggestedActions: stubs.chatOperations.clearSuggestedActions,
        dismissNotification: stubs.notifications.dismissNotification,
        emitTypingIndicator: stubs.sendBox.emitTypingIndicator,
        markActivity: stubs.chatOperations.markActivity,
        postActivity: stubs.chatOperations.postActivity,
        sendEvent: stubs.chatOperations.sendEvent,
        sendFiles: stubs.chatOperations.sendFiles,
        sendMessage: stubs.chatOperations.sendMessage,
        sendMessageBack: stubs.chatOperations.sendMessageBack,
        sendPostBack: stubs.chatOperations.sendPostBack,
        setDictateInterims: stubs.speech.setDictateInterims,
        setDictateState: stubs.speech.setDictateState,
        setNotification: stubs.notifications.setNotification,
        setSendBox: stubs.sendBox.setValue,
        setSendBoxAttachments: stubs.sendBox.setAttachments,
        setSendTimeout: stubs.chatOperations.setSendTimeout,
        startDictate: stubs.speech.startDictate,
        startSpeakingActivity: stubs.speech.startSpeakingActivity,
        startVoice: stubs.voice.startVoice,
        stopDictate: stubs.speech.stopDictate,
        stopSpeakingActivity: stubs.speech.stopSpeakingActivity,
        submitSendBox: stubs.sendBox.submit
      })
    );
  });

  test('stopVoice() should stop the audio of every voice handler, then stop the voice', () => {
    const stubs = createStubs();
    let context: WebChatAPIContextType;

    renderComposerCore(stubs, value => {
      context = value;

      return null;
    });

    context.stopVoice();

    expect(stubs.stopAllAudio).toHaveBeenCalledTimes(1);
    expect(stubs.voice.stopVoice).toHaveBeenCalledTimes(1);
  });

  test('onCardAction() should stop dictation through the speech domain, then dispatch through the chat operations', () => {
    const stubs = createStubs();
    let context: WebChatAPIContextType;

    renderComposerCore(stubs, value => {
      context = value;

      return null;
    });

    context.onCardAction({ title: 'Hi', type: 'imBack', value: 'Hi' });

    expect(stubs.speech.stopDictate).toHaveBeenCalledTimes(1);
    expect((stubs.speech.stopDictate as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan(
      (stubs.chatOperations.dispatch as jest.Mock).mock.invocationCallOrder[0]
    );
    expect(stubs.chatOperations.dispatch).toHaveBeenCalledTimes(1);
    expect(stubs.chatOperations.dispatch).toHaveBeenCalledWith(sendMessage('Hi', 'imBack', { replyToId: undefined }));
  });

  test('hooks under it should read the domain contexts', () => {
    const stubs = createStubs();
    const values: unknown[] = [];

    function Probe() {
      values.push([useConnectivityStatus()[0], useSendBoxValue()]);

      return null;
    }

    renderComposerCore(stubs, () => <Probe />);

    expect(values.at(-1)).toEqual(['connected', ['Hello', stubs.sendBox.setValue]]);
  });
});
