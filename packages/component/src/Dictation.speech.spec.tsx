/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />
/* eslint-disable no-restricted-globals */

// The Web Speech calls of the real <Dictation> (react-dictate-button) and <Speak> (react-say), in both modes: through
// <BasicWebChat>, the same calls to the ponyfill (SpeechRecognition, start, abort, speak, cancel) in the same steps, and
// the same calls to Direct Line. The ponyfill is the one of the html2 tests.

// The html2 mocks of speech synthesis import this from esm.sh: the part they use.
jest.mock(
  'https://esm.sh/event-target-properties',
  () => ({
    EventTargetProperties: class {
      #handlers = new Map();
      #target;

      constructor(target) {
        this.#target = target;
      }

      getProperty(name) {
        return this.#handlers.get(name) || null;
      }

      setProperty(name, handler) {
        const previous = this.#handlers.get(name);

        previous && this.#target.removeEventListener(name, previous);
        this.#handlers.set(name, handler);
        handler && this.#target.addEventListener(name, handler);
      }
    }
  }),
  { virtual: true }
);

jest.mock(
  'https://unpkg.com/event-target-properties@latest/dist/event-target-properties.mjs',
  () => jest.requireMock('https://esm.sh/event-target-properties'),
  { virtual: true }
);

import { act, fireEvent, render } from '@testing-library/react';
import { __INTERNAL_DO_NOT_USE__setDefaultModeEnabled as setDefaultModeEnabled } from 'botframework-webchat-api/internal.js';
import { Components } from 'botframework-webchat-component';
import React from 'react';

import { createWebSpeechPonyfill } from '../../../__tests__/assets/esm/speech/speechPageObjects.js';
import SpeechSynthesisEvent from '../../../__tests__/assets/esm/speech/MockedSpeechSynthesisEvent.js';

// The mocks of react-dictate-button, as the html2 tests use them (their types are not published).
const {
  SpeechRecognitionAlternative,
  SpeechRecognitionEvent,
  SpeechRecognitionResult,
  SpeechRecognitionResultList
} = require('react-dictate-button/internal');

const { BasicWebChat, Composer } = Components;

function returnsPonyfill<T>(ponyfill: T, calls: string[]): (init: unknown) => T {
  return init => {
    calls.push(`webSpeechPonyfillFactory(${JSON.stringify(init)})`);

    return ponyfill;
  };
}

// Not in the test environment: the activities core clones with it.
const v8 = require('v8');

globalThis.structuredClone || (globalThis.structuredClone = value => v8.deserialize(v8.serialize(value)));

async function flush() {
  for (let index = 0; index < 20; index++) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
}

async function runScript(mode: 'default' | 'redux') {
  const calls: string[] = [];
  const activityObservers = new Set<any>();
  const recognitions: any[] = [];
  const steps: unknown[] = [];
  const utterances: any[] = [];

  setDefaultModeEnabled(mode === 'default');

  const ponyfill: any = createWebSpeechPonyfill();
  const { SpeechRecognition } = ponyfill;

  // Each SpeechRecognition: logged, start() and abort() logged (no microphone: the script plays its events).
  ponyfill.SpeechRecognition = jest.fn((...args) => {
    const recognition = new SpeechRecognition(...args);
    const n = recognitions.push(recognition);

    calls.push(`new SpeechRecognition#${n}`);
    jest.spyOn(recognition, 'start').mockImplementation(() => calls.push(`recognition#${n}.start()`));
    jest.spyOn(recognition, 'abort').mockImplementation(() => calls.push(`recognition#${n}.abort()`));

    return recognition;
  });

  // Each utterance: logged, started, then ended a turn later (as the html2 helper `actSpeak()`).
  jest.spyOn(ponyfill.speechSynthesis, 'speak').mockImplementation((utterance: any) => {
    calls.push(`speak(${JSON.stringify(utterance.text)})`);
    utterances.push(utterance);
    utterance.dispatchEvent(new SpeechSynthesisEvent('start', { utterance }));
    // A long one is spoken until cancelled.
    utterance.text.startsWith('long:') ||
      Promise.resolve().then(() => utterance.dispatchEvent(new SpeechSynthesisEvent('end', { utterance })));
  });
  jest.spyOn(ponyfill.speechSynthesis, 'cancel').mockImplementation(() => {
    calls.push('cancel()');

    const utterance = utterances.at(-1);

    utterance && utterance.dispatchEvent(new SpeechSynthesisEvent('end', { utterance }));
  });

  const directLine = {
    activity$: {
      subscribe: (observer: any) => {
        activityObservers.add(observer);

        return { unsubscribe: () => activityObservers.delete(observer) };
      }
    },
    connectionStatus$: {
      subscribe: (observer: any) => {
        observer.next(2);

        return { unsubscribe: () => undefined };
      }
    },
    end: () => calls.push('end()'),
    // Read on each connection status: Web Chat creates the ponyfill again with it.
    referenceGrammarId: 'g-1',
    postActivity: (activity: any) => {
      calls.push(`postActivity(${activity.type}:${activity.text ?? ''})`);

      return {
        subscribe: (observer: any) => {
          observer.next('x');

          return { unsubscribe: () => undefined };
        }
      };
    }
  };

  const emitActivity = (activity: unknown) =>
    Array.from(activityObservers).forEach(observer => observer.next(activity));
  const webSpeechPonyfillFactory = returnsPonyfill(ponyfill, calls);

  const result = render(
    <Composer directLine={directLine} userID="u-1" webSpeechPonyfillFactory={webSpeechPonyfillFactory}>
      <BasicWebChat />
    </Composer>
  );

  const step = async (label: string, fn?: () => void) => {
    act(() => {
      fn?.();
    });

    // React 16.8 has no async act(): the updates from the microtasks render outside act().
    await flush();
    // Then their effects (e.g. react-dictate-button starting the recognition), and what they do.
    act(() => undefined);
    await flush();

    steps.push({ calls: calls.splice(0), label });
  };

  const recognition = () => recognitions.at(-1) || { dispatchEvent: () => calls.push('no recognition') };
  const recognitionResult = (transcript: string, isFinal: boolean) =>
    new SpeechRecognitionEvent('result', {
      results: new SpeechRecognitionResultList(
        isFinal
          ? SpeechRecognitionResult.fromFinalized(new SpeechRecognitionAlternative(0.9, transcript))
          : new SpeechRecognitionResult(new SpeechRecognitionAlternative(0.9, transcript))
      )
    });

  const microphoneButton = () => result.container.querySelector('[data-testid="send box microphone button"]');
  const textBox = () => result.container.querySelector('[data-testid="send box text area"]');
  const click = () => {
    const button = microphoneButton();

    button ? fireEvent.click(button) : calls.push('no microphone button');
  };
  const botMessage = (id: string, inputHint: string, text: string) => ({
    from: { id: 'bot', role: 'bot' },
    id,
    inputHint,
    text,
    timestamp: new Date(1_000).toISOString(),
    type: 'message'
  });

  await step('mount, online');
  await step('click the microphone', click);
  await step('recognition starts, interim', () => {
    for (const type of ['start', 'audiostart', 'soundstart', 'speechstart']) {
      recognition().dispatchEvent(new Event(type));
    }

    recognition().dispatchEvent(recognitionResult('hel', false));
  });
  await step('recognized', () => recognition().dispatchEvent(recognitionResult('hello', true)));
  await step('recognition ends', () => {
    for (const type of ['speechend', 'soundend', 'audioend', 'end']) {
      recognition().dispatchEvent(new Event(type));
    }
  });
  // Spoken, then the dictation starts.
  await step('bot expecting input', () => emitActivity(botMessage('b1', 'expectingInput', 'What else?')));
  await step('click the microphone while starting', click);
  await step('recognition ends again', () => recognition().dispatchEvent(new Event('end')));
  // Spoken until typing stops it.
  await step('bot accepting input, long', () => emitActivity(botMessage('b2', 'acceptingInput', 'long: a story')));
  await step('type in the send box', () => fireEvent.change(textBox(), { target: { value: 'typed' } }));
  await step('unmount', () => result.unmount());

  return steps;
}

test('the real <Dictation> and <Speak> call Web Speech the same in both modes', async () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

  try {
    const redux = await runScript('redux');
    const defaultMode = await runScript('default');

    expect(defaultMode).toEqual(redux);
    expect(defaultMode.map(({ calls, label }: any) => [label, calls])).toEqual([
      // Created without a reference grammar ID, then with the one of Direct Line once connected.
      [
        'mount, online',
        [
          'webSpeechPonyfillFactory({"referenceGrammarID":null})',
          'webSpeechPonyfillFactory({"referenceGrammarID":"g-1"})'
        ]
      ],
      // The microphone button primes the speech synthesis, then the dictation starts.
      ['click the microphone', ['speak("")', 'new SpeechRecognition#1', 'recognition#1.start()']],
      ['recognition starts, interim', []],
      ['recognized', ['postActivity(message:hello)']],
      ['recognition ends', ['recognition#1.abort()']],
      // Spoken, as the message was sent by speech; it expects input, so the dictation starts after the speech.
      ['bot expecting input', ['speak("What else?")', 'new SpeechRecognition#2', 'recognition#2.start()']],
      ['click the microphone while starting', []],
      ['recognition ends again', ['recognition#2.abort()']],
      ['bot accepting input, long', ['speak("long: a story")']],
      // Typing stops the speech.
      ['type in the send box', ['cancel()']],
      ['unmount', ['end()']]
    ]);
  } finally {
    error.mockRestore();
    warn.mockRestore();
    setDefaultModeEnabled(false);
  }
});
