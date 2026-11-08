/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { render } from '@testing-library/react';
import {
  clearSuggestedActions,
  createStore,
  dismissNotification,
  emitTypingIndicator,
  markActivity,
  postActivity,
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
  startDictate,
  startSpeakingActivity,
  startVoiceRecording,
  stopDictate,
  stopSpeakingActivity,
  stopVoiceRecording,
  submitSendBox,
  type VoiceHandler,
  type WebChatActivity
} from 'botframework-webchat-core';
import React from 'react';

import Composer from './Composer';
import { type WebChatAPIContextType } from './internal/WebChatAPIContext';

type Action = { readonly payload?: unknown; readonly type: string };

function createDirectLine() {
  const subscription = Object.freeze({ unsubscribe: jest.fn() });

  return {
    activity$: { subscribe: jest.fn(() => subscription) },
    connectionStatus$: { subscribe: jest.fn(() => subscription) },
    end: jest.fn(),
    postActivity: jest.fn()
  };
}

function renderComposer() {
  const actions: Action[] = [];
  const contexts: WebChatAPIContextType[] = [];
  const directLine = createDirectLine();
  let passThrough = true;

  const store = createStore({}, () => next => (action: Action) => {
    actions.push(action);

    // Stops actions before the reducer and the sagas, to check what was dispatched without side effects.
    return passThrough ? next(action) : action;
  });

  const children = (context: WebChatAPIContextType) => {
    contexts.push(context);

    return null;
  };

  const result = render(
    <Composer
      directLine={directLine}
      locale="en-GB"
      sendTypingIndicator={true}
      store={store}
      userID="u-1"
      username="User"
    >
      {children}
    </Composer>
  );

  return {
    actions,
    children,
    contexts,
    directLine,
    result,
    stopPassThrough: () => {
      passThrough = false;
    },
    store
  };
}

describe('<Composer> over a Redux store', () => {
  test('should dispatch language, typing indicator and connect after the effects of its children, as before', () => {
    const { actions, directLine, result } = renderComposer();

    // These are the order of <Composer> before its effects moved to <ReduxSessionEffects>: its children (none here
    // dispatch), then <Composer>, then the action sink of suggested actions, an effect of an ancestor.
    expect(
      actions
        .map(({ type }) => type)
        .filter(type =>
          [
            'DIRECT_LINE/CONNECT',
            'WEB_CHAT/SET_LANGUAGE',
            'WEB_CHAT/SET_SEND_TYPING_INDICATOR',
            'WEB_CHAT_INTERNAL/REGISTER_ACTION_SINK'
          ].includes(type)
        )
    ).toEqual([
      'WEB_CHAT/SET_LANGUAGE',
      'WEB_CHAT/SET_SEND_TYPING_INDICATOR',
      'DIRECT_LINE/CONNECT',
      'WEB_CHAT_INTERNAL/REGISTER_ACTION_SINK'
    ]);

    expect(actions.find(({ type }) => type === 'DIRECT_LINE/CONNECT')).toHaveProperty('payload', {
      directLine,
      userID: 'u-1',
      username: 'User'
    });

    expect(actions.find(({ type }) => type === 'WEB_CHAT/SET_LANGUAGE')).toHaveProperty('payload', {
      language: 'en-GB'
    });

    result.unmount();
  });

  test('should disconnect in a microtask after unmount', async () => {
    const { actions, result } = renderComposer();

    result.unmount();

    expect(actions.map(({ type }) => type)).not.toContain('DIRECT_LINE/DISCONNECT');

    await Promise.resolve();

    expect(actions.map(({ type }) => type)).toContain('DIRECT_LINE/DISCONNECT');
  });

  test('should set the language again when locale changes', () => {
    const { actions, children, directLine, result, store } = renderComposer();

    actions.splice(0);

    result.rerender(
      <Composer
        directLine={directLine}
        locale="ja-JP"
        sendTypingIndicator={true}
        store={store}
        userID="u-1"
        username="User"
      >
        {children}
      </Composer>
    );

    expect(actions.map(({ type }) => type)).toEqual(['WEB_CHAT/SET_LANGUAGE']);

    result.unmount();
  });

  describe('the dispatchers of WebChatAPIContext', () => {
    const activity = { from: { id: 'u-1' }, id: 'a-1', type: 'message' } as WebChatActivity;

    // Each dispatcher must dispatch what its action creator returns, given the same arguments, as `mapMap(DISPATCHERS)` did.
    test.each([
      ['clearSuggestedActions', [], clearSuggestedActions],
      ['dismissNotification', ['n-1'], dismissNotification],
      ['emitTypingIndicator', [], emitTypingIndicator],
      ['markActivity', [activity, 'name', 'value'], markActivity],
      ['postActivity', [activity], postActivity],
      ['sendEvent', ['name', { value: 1 }], sendEvent],
      ['sendFiles', [[{ name: 'a.txt', size: 1, url: 'blob:a' }]], sendFiles],
      ['sendMessage', ['Hello', 'keyboard', { channelData: { a: 1 } }], sendMessage],
      ['sendMessageBack', [{ value: 1 }, 'text', 'display'], sendMessageBack],
      ['sendPostBack', [{ value: 1 }], sendPostBack],
      ['setDictateInterims', [['Hel']], setDictateInterims],
      ['setDictateState', [1], setDictateState],
      ['setNotification', [{ alt: 'A', id: 'n-1', level: 'info', message: 'A' }], setNotification],
      ['setSendBox', ['Hello'], setSendBox],
      ['setSendBoxAttachments', [[]], setSendBoxAttachments],
      ['setSendTimeout', [1000], setSendTimeout],
      ['startDictate', [], startDictate],
      ['startSpeakingActivity', [], startSpeakingActivity],
      ['stopDictate', [], stopDictate],
      ['stopSpeakingActivity', [], stopSpeakingActivity],
      ['submitSendBox', ['keyboard', { channelData: { a: 1 } }], submitSendBox],
      ['startVoice', [], startVoiceRecording],
      ['stopVoice', [], stopVoiceRecording]
    ] as [string, unknown[], (...args: unknown[]) => Action][])('%s()', (name, args, actionCreator) => {
      const { actions, contexts, result, stopPassThrough } = renderComposer();

      stopPassThrough();
      actions.splice(0);

      // eslint-disable-next-line security/detect-object-injection
      const returnValue = contexts.at(-1)[name](...args);

      expect(actions).toEqual([actionCreator(...args)]);

      // The hoisted dispatchers returned what `dispatch()` returns; startVoice() and stopVoice() returned nothing.
      name === 'startVoice' || name === 'stopVoice'
        ? expect(returnValue).toBeUndefined()
        : expect(returnValue).toBe(actions[0]);

      result.unmount();
    });

    test('stopVoice() should stop the audio of every voice handler first', () => {
      const { actions, contexts, result, store } = renderComposer();
      const stopAllAudio = jest.fn(() => expect(actions.at(-1)?.type).not.toBe('WEB_CHAT/VOICE_STOP_RECORDING'));
      const numContexts = contexts.length;

      store.dispatch(registerVoiceHandler('h-1', { queueAudio: jest.fn(), stopAllAudio } as unknown as VoiceHandler));

      // The context changes with the voice handlers, as before.
      expect(contexts.length).toBeGreaterThan(numContexts);
      expect(contexts.at(-1).stopVoice).not.toBe(contexts[numContexts - 1].stopVoice);

      contexts.at(-1).stopVoice();

      expect(stopAllAudio).toHaveBeenCalledTimes(1);
      expect(actions.at(-1)).toEqual(stopVoiceRecording());

      result.unmount();
    });
  });
});
