/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />
/* eslint-disable no-restricted-globals */

// "No Redux in default mode": when <Composer> mounts the default providers, nothing of `redux` is called. Every function
// it exports is wrapped in a mock, which core (its dist) calls through `require()`.
function mockFunctionsOf(moduleName: string): Record<string, unknown> {
  const actual: Record<string, unknown> = jest.requireActual(moduleName);

  return {
    ...Object.fromEntries(
      Object.entries(actual).map(([name, value]) => [
        name,
        typeof value === 'function' ? jest.fn(value as (...args: unknown[]) => unknown) : value
      ])
    ),
    __esModule: true
  };
}

jest.mock('redux', () => mockFunctionsOf('redux'));

// No microphone in the tests: speech-to-speech records nothing (both modes).
jest.mock('../providers/SpeechToSpeech/private/useRecorder', () => ({
  useRecorder: () => ({ mute: () => () => undefined, record: () => () => undefined })
}));

import { act, render } from '@testing-library/react';
import { createStore as createWebChatStore, type WebChatActivity } from 'botframework-webchat-core';
import lolex from 'lolex';
import React, { memo, useEffect } from 'react';
import * as redux from 'redux';

import { getTestHandle } from '../providers/default/private/testHandles';
import { getProviderMountCounts, setInternalDefaultModeEnabled } from '../providers/internalDefaultMode';
import Composer from './Composer';
import { type WebChatAPIContextType } from './internal/WebChatAPIContext';
import useActivities from './useActivities';
import useConnectivityStatus from './useConnectivityStatus';
import useDictateInterims from './useDictateInterims';
import useDictateState from './useDictateState';
import useNotifications from './useNotifications';
import useReferenceGrammarID from './useReferenceGrammarID';
import useSendBoxValue from './useSendBoxValue';
import useShouldSpeakIncomingActivity from './useShouldSpeakIncomingActivity';
import useSuggestedActions from './useSuggestedActions';
import useVoiceRecordingMuted from './useVoiceRecordingMuted';
import useVoiceState from './useVoiceState';
import usePostVoiceActivity from './internal/usePostVoiceActivity';
import useRegisterVoiceHandler from './internal/useRegisterVoiceHandler';
import useVoiceHandlers from './internal/useVoiceHandlers';

// A Direct Line that logs the calls made to it, in order. `connectionStatus$` replays the current status, as DirectLineJS.
function createScriptedDirectLine(name: string, calls: string[]) {
  const activityObservers = new Set<{ next?: (value: unknown) => void }>();
  const statusObservers = new Set<{ next?: (value: unknown) => void }>();
  let numActivitySubscriptions = 0;
  let numStatusSubscriptions = 0;
  let status = 0;

  return {
    directLine: {
      activity$: {
        subscribe: (observer: { next?: (value: unknown) => void }) => {
          const id = ++numActivitySubscriptions;

          calls.push(`${name}.activity$.subscribe#${id}`);
          activityObservers.add(observer);

          return {
            unsubscribe: () => activityObservers.delete(observer) && calls.push(`${name}.activity$.unsubscribe#${id}`)
          };
        }
      },
      connectionStatus$: {
        subscribe: (observer: { next?: (value: unknown) => void }) => {
          const id = ++numStatusSubscriptions;

          calls.push(`${name}.connectionStatus$.subscribe#${id}`);
          statusObservers.add(observer);
          observer.next?.(status);

          return {
            unsubscribe: () =>
              statusObservers.delete(observer) && calls.push(`${name}.connectionStatus$.unsubscribe#${id}`)
          };
        }
      },
      end: () => calls.push(`${name}.end()`),
      postActivity: jest.fn(),
      setUserId: (userID: string) => calls.push(`${name}.setUserId(${userID})`)
    },
    emitActivity: (activity: unknown) => Array.from(activityObservers).forEach(observer => observer.next?.(activity)),
    emitStatus: (value: number) => {
      status = value;
      Array.from(statusObservers).forEach(observer => observer.next?.(value));
    }
  };
}

function createDirectLine() {
  const subscription = Object.freeze({ unsubscribe: jest.fn() });

  return {
    activity$: { subscribe: jest.fn(() => subscription) },
    connectionStatus$: { subscribe: jest.fn(() => subscription) },
    end: jest.fn(),
    postActivity: jest.fn()
  };
}

// The functions of `redux` that were called, by name.
function getReduxCalls(): string[] {
  return Object.entries(redux)
    .map(([name, value]) => [`redux.${name}`, value] as const)
    .filter(([, value]) => jest.isMockFunction(value) && value.mock.calls.length)
    .map(([name]) => name);
}

type Probe = {
  readonly activities: readonly WebChatActivity[];
  readonly connectivityStatus: string;
};

function createProbe() {
  const contexts: WebChatAPIContextType[] = [];
  const renders: Probe[] = [];
  let numMounts = 0;

  function HookProbe() {
    const [activities] = useActivities();
    const [connectivityStatus] = useConnectivityStatus();

    renders.push({ activities, connectivityStatus });

    useEffect(() => {
      numMounts++;
    }, []);

    return null;
  }

  const MemoHookProbe = memo(HookProbe);

  const children = (context: WebChatAPIContextType) => {
    contexts.push(context);

    return <MemoHookProbe />;
  };

  return { children, contexts, getNumMounts: () => numMounts, renders };
}

let warn: jest.SpyInstance;

beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.clearAllMocks();
});

afterEach(() => {
  setInternalDefaultModeEnabled(false);
  warn.mockRestore();
});

describe('<Composer> without a store', () => {
  test('should call nothing of redux with the default providers', () => {
    const directLine = createDirectLine();
    const { children, contexts, renders } = createProbe();

    setInternalDefaultModeEnabled(true);

    const result = render(<Composer directLine={directLine}>{children}</Composer>);

    // <ComposerCore> and the hooks under it rendered, without Redux.
    expect(contexts.length).toBeGreaterThan(0);
    expect(typeof contexts.at(-1)?.sendMessage).toBe('function');
    expect(renders.at(-1)).toEqual({ activities: [], connectivityStatus: 'uninitialized' });

    // Connected by the machines of the default providers, without Redux.
    expect(directLine.activity$.subscribe).toHaveBeenCalledTimes(1);

    act(() => contexts.at(-1)?.sendMessage('Hello', 'keyboard'));
    result.unmount();

    expect(getReduxCalls()).toEqual([]);
  });

  test('should create a Redux store when the default providers are not enabled, as today', () => {
    const directLine = createDirectLine();
    const { children, renders } = createProbe();

    const result = render(<Composer directLine={directLine}>{children}</Composer>);

    expect(renders.length).toBeGreaterThan(0);

    // The spies work: core created its Redux store, with its middleware (the machines).
    expect(getReduxCalls()).toEqual(expect.arrayContaining(['redux.applyMiddleware', 'redux.createStore']));
    expect(redux.createStore).toHaveBeenCalledTimes(1);

    result.unmount();
  });
});

describe('the provider set of <Composer>', () => {
  test('should follow `store` first, then the switch, and remount when it changes', () => {
    const directLine = createDirectLine();
    const store = createWebChatStore();
    const store2 = createWebChatStore();
    const { children, getNumMounts } = createProbe();

    setInternalDefaultModeEnabled(true);

    // A host store: Redux providers, even when the switch is on.
    const result = render(
      <Composer directLine={directLine} store={store}>
        {children}
      </Composer>
    );

    expect(getNumMounts()).toBe(1);
    expect(directLine.activity$.subscribe).toHaveBeenCalled();

    // Swapping the store keeps the Redux providers, and the children, as today.
    result.rerender(
      <Composer directLine={directLine} store={store2}>
        {children}
      </Composer>
    );

    expect(getNumMounts()).toBe(1);

    jest.clearAllMocks();

    // No store, the switch on: the default providers. The children remount.
    result.rerender(<Composer directLine={directLine}>{children}</Composer>);

    expect(getNumMounts()).toBe(2);
    expect(redux.createStore).not.toHaveBeenCalled();

    // The switch off: Redux providers with a store created for the host. The children remount.
    setInternalDefaultModeEnabled(false);

    result.rerender(<Composer directLine={directLine}>{children}</Composer>);

    expect(getNumMounts()).toBe(3);
    expect(redux.createStore).toHaveBeenCalledTimes(1);

    result.unmount();
  });

  test('should only accept a boolean for the switch', () => {
    expect(() => setInternalDefaultModeEnabled('true' as unknown as boolean)).toThrow();
  });
});

describe('the connection of the default providers', () => {
  test('should count the mounts of each provider set, and give a test handle while connected', async () => {
    const calls: string[] = [];
    const dl = createScriptedDirectLine('dl', calls);
    const before = getProviderMountCounts();

    setInternalDefaultModeEnabled(true);

    const result = render(<Composer directLine={dl.directLine}>{() => null}</Composer>);

    expect(getProviderMountCounts()).toEqual({ default: before.default + 1, redux: before.redux });

    act(() => dl.emitStatus(2));
    await Promise.resolve();
    await Promise.resolve();

    expect(getTestHandle(dl.directLine)?.getConnectivityStatus()).toBe('connected');
    expect(getTestHandle()).toBe(getTestHandle(dl.directLine));
    expect(getTestHandle(dl.directLine)?.getActivities()).toEqual([]);

    result.unmount();
    await Promise.resolve();

    expect(getTestHandle(dl.directLine)).toBeUndefined();
    expect(getTestHandle()).toBeUndefined();

    setInternalDefaultModeEnabled(false);

    render(<Composer directLine={createDirectLine()}>{() => null}</Composer>).unmount();

    expect(getProviderMountCounts()).toEqual({ default: before.default + 1, redux: before.redux + 1 });
  });
  async function flush() {
    for (let index = 0; index < 20; index++) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.resolve();
    }
  }

  // The same script in each mode: what the hooks show and what Direct Line is called with, after every step.
  async function runScript(mode: 'default' | 'redux') {
    const calls: string[] = [];
    const dl1 = createScriptedDirectLine('dl1', calls);
    const dl2 = createScriptedDirectLine('dl2', calls);
    const renders: unknown[] = [];
    const steps: unknown[] = [];

    setInternalDefaultModeEnabled(mode === 'default');

    const HookProbe = memo(() => {
      const [activities] = useActivities();
      const [connectivityStatus] = useConnectivityStatus();
      const [notifications] = useNotifications();
      const [referenceGrammarID] = useReferenceGrammarID();
      const [suggestedActions] = useSuggestedActions();

      renders.push({
        activities: activities.map(({ from: { name, role }, id, ...activity }) => ({
          id,
          name,
          role,
          text: (activity as { text?: string }).text
        })),
        connectivityStatus,
        // The timestamps are from the clock.
        notifications: Object.values(notifications as unknown as Record<string, any>).map(({ id, level, message }) => ({
          id,
          level,
          message
        })),
        referenceGrammarID,
        suggestedActions
      });

      return null;
    });

    const result = render(
      <Composer directLine={dl1.directLine} userID="u-1" username="User">
        <HookProbe />
      </Composer>
    );

    const step = async (label: string, fn?: () => void) => {
      // React 16.8 has no async act(): the updates from the microtasks of Direct Line render outside act().
      act(() => {
        fn?.();
      });

      await flush();

      steps.push({ calls: calls.splice(0), label, last: renders.at(-1), renders: renders.splice(0).length });
    };

    await step('mount');
    await step('status 1', () => dl1.emitStatus(1));
    await step('status 2', () => dl1.emitStatus(2));
    await step('bot message with suggested actions', () =>
      dl1.emitActivity({
        from: { id: 'bot', name: 'bot' },
        channelId: 'directline',
        id: 'a-1',
        suggestedActions: { actions: [{ title: 'Hi', type: 'imBack', value: 'Hi' }] },
        text: 'Hello',
        timestamp: new Date(1_000).toISOString(),
        type: 'message'
      })
    );
    await step('reconnecting', () => dl1.emitStatus(1));
    await step('reconnected', () => dl1.emitStatus(2));
    await step('swap Direct Line', () =>
      result.rerender(
        <Composer directLine={dl2.directLine} userID="u-1" username="User">
          <HookProbe />
        </Composer>
      )
    );
    await step('dl2 status 2', () => dl2.emitStatus(2));
    await step('unmount', () => result.unmount());

    return steps;
  }

  test('should show the same as Redux mode, and call Direct Line the same', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const redux = await runScript('redux');

      jest.clearAllMocks();

      const defaultMode = await runScript('default');

      // One difference, on purpose: after unmount, the default providers release the notification subscription, which
      // Redux mode keeps until the store is garbage collected.
      expect((defaultMode.at(-1) as any).calls.at(-1)).toBe('dl2.connectionStatus$.unsubscribe#1');
      (defaultMode.at(-1) as any).calls.pop();

      expect(defaultMode).toEqual(redux);
      expect(getReduxCalls()).toEqual([]);

      // What it shows, to read the comparison.
      expect(defaultMode.map(({ label, last }: any) => [label, last?.connectivityStatus])).toEqual([
        ['mount', 'uninitialized'],
        ['status 1', undefined],
        ['status 2', 'connected'],
        ['bot message with suggested actions', 'connected'],
        ['reconnecting', 'reconnecting'],
        ['reconnected', 'reconnected'],
        ['swap Direct Line', 'reconnecting'],
        ['dl2 status 2', 'connected'],
        ['unmount', undefined]
      ]);

      // Only the warnings of React about updates outside act().
      expect(error.mock.calls.filter(([message]) => !String(message).includes('not wrapped in act'))).toEqual([]);
    } finally {
      error.mockRestore();
    }
  });
});

describe('sending with the default providers', () => {
  // A Direct Line that goes online, logs the posts and the subscriptions of what they return, and lets the script
  // return or fail each post and echo it back.
  function createPostingDirectLine(calls: string[]) {
    const activityObservers = new Set<{ next?: (value: unknown) => void }>();
    const posts: { activity: any; observer?: any }[] = [];

    return {
      directLine: {
        activity$: {
          subscribe: (observer: { next?: (value: unknown) => void }) => {
            activityObservers.add(observer);

            return { unsubscribe: () => activityObservers.delete(observer) };
          }
        },
        connectionStatus$: {
          subscribe: (observer: { next?: (value: unknown) => void }) => {
            observer.next?.(2);

            return { unsubscribe: () => undefined };
          }
        },
        end: () => calls.push('end()'),
        postActivity: (activity: any) => {
          const post: { activity: any; observer?: any } = { activity };
          const n = posts.push(post);

          calls.push(`postActivity#${n}(${activity.type}:${activity.text ?? activity.name ?? ''})`);

          return {
            subscribe: (observer: any) => {
              post.observer = observer;

              return { unsubscribe: () => calls.push(`post#${n}.unsubscribe`) };
            }
          };
        },
        setUserId: () => undefined
      },
      echo: (n: number) =>
        Array.from(activityObservers).forEach(observer =>
          observer.next?.({ ...posts[n - 1].activity, id: `a${n}`, timestamp: new Date(n * 1_000).toISOString() })
        ),
      emitActivity: (activity: unknown) => Array.from(activityObservers).forEach(observer => observer.next?.(activity)),
      fail: (n: number) => posts[n - 1].observer.error(new Error('artificial')),
      numPosts: () => posts.length,
      ret: (n: number) => posts[n - 1].observer.next(`a${n}`)
    };
  }

  async function flush() {
    for (let index = 0; index < 20; index++) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.resolve();
    }
  }

  // The same script in each mode: typing, submit, a card action, a failed post and its retry.
  async function runSendingScript(mode: 'default' | 'redux') {
    const calls: string[] = [];
    const clock = lolex.createClock();
    const contexts: WebChatAPIContextType[] = [];
    const dl = createPostingDirectLine(calls);
    const renders: unknown[] = [];
    const steps: unknown[] = [];
    let latestActivities: readonly WebChatActivity[] = [];

    setInternalDefaultModeEnabled(mode === 'default');

    const HookProbe = memo(() => {
      const [activities] = useActivities();
      const [sendBoxValue] = useSendBoxValue();
      const [suggestedActions] = useSuggestedActions();

      latestActivities = activities;
      renders.push({
        activities: activities.map(({ channelData, id, text, type }: any) => ({
          id,
          sendStatus: channelData?.['webchat:send-status'],
          state: channelData?.state,
          text,
          type
        })),
        sendBoxValue,
        suggestedActions: suggestedActions.length
      });

      return null;
    });

    const children = (context: WebChatAPIContextType) => {
      contexts.push(context);

      return <HookProbe />;
    };

    const result = render(
      <Composer
        directLine={dl.directLine}
        ponyfill={{ ...clock }}
        sendTypingIndicator={true}
        userID="u-1"
        username="User"
      >
        {children}
      </Composer>
    );

    const step = async (label: string, fn?: () => void) => {
      act(() => {
        fn?.();
      });

      await flush();

      steps.push({ calls: calls.splice(0), label, last: renders.at(-1), renders: renders.splice(0).length });
    };

    const context = () => contexts.at(-1);

    await step('mount, online');
    await step('bot message with suggested actions', () =>
      dl.emitActivity({
        from: { id: 'bot', role: 'bot' },
        id: 'b1',
        suggestedActions: { actions: [{ title: 'Hi', type: 'imBack', value: 'Hi' }] },
        text: 'Hello',
        timestamp: new Date(500).toISOString(),
        type: 'message'
      })
    );
    await step('type "H"', () => context().setSendBox('H'));
    await step('t=1000, type "Hi"', () => {
      clock.tick(1_000);
      context().setSendBox('Hi');
    });
    await step('submit', () => context().submitSendBox());
    await step('return and echo the posts', () => {
      for (let n = 1; n <= dl.numPosts(); n++) {
        dl.ret(n);
        dl.echo(n);
      }
    });
    await step('card action imBack', () => context().onCardAction({ title: 'card', type: 'imBack', value: 'card' }));
    await step('the card action post fails', () => dl.fail(dl.numPosts()));
    await step('retry', () => context().postActivity(latestActivities.at(-1)));
    await step('return and echo the retry', () => {
      dl.ret(dl.numPosts());
      dl.echo(dl.numPosts());
    });
    await step('t=30000', () => clock.tick(29_000));
    await step('unmount', () => result.unmount());

    return steps;
  }

  test('should show the same as Redux mode, with the same renders and calls to Direct Line', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const redux = await runSendingScript('redux');

      jest.clearAllMocks();

      const defaultMode = await runSendingScript('default');

      expect(defaultMode).toEqual(redux);
      expect(getReduxCalls()).toEqual([]);

      // What it shows, to read the comparison.
      expect(defaultMode.map(({ calls, label }: any) => [label, calls])).toEqual([
        ['mount, online', []],
        ['bot message with suggested actions', []],
        ['type "H"', ['postActivity#1(typing:)']],
        ['t=1000, type "Hi"', []],
        ['submit', ['postActivity#2(message:Hi)']],
        ['return and echo the posts', ['post#1.unsubscribe', 'post#2.unsubscribe']],
        ['card action imBack', ['postActivity#3(message:card)']],
        ['the card action post fails', ['post#3.unsubscribe']],
        ['retry', ['postActivity#4(message:card)']],
        ['return and echo the retry', ['post#4.unsubscribe']],
        ['t=30000', []],
        ['unmount', ['end()']]
      ]);
      expect((defaultMode.find(({ label }: any) => label === 'return and echo the retry') as any).last).toEqual({
        activities: [
          { id: 'b1', sendStatus: undefined, state: undefined, text: 'Hello', type: 'message' },
          { id: 'a1', sendStatus: 'sent', state: 'sent', text: undefined, type: 'typing' },
          { id: 'a2', sendStatus: 'sent', state: 'sent', text: 'Hi', type: 'message' },
          { id: undefined, sendStatus: 'send failed', state: 'send failed', text: 'card', type: 'message' },
          { id: 'a4', sendStatus: 'sent', state: 'sent', text: 'card', type: 'message' }
        ],
        sendBoxValue: '',
        suggestedActions: 0
      });
    } finally {
      error.mockRestore();
    }
  });

  // clearSuggestedActions() when there is nothing to clear: no re-render, as in Redux mode (the same empty array).
  async function runClearScript(mode: 'default' | 'redux') {
    const calls: string[] = [];
    const contexts: WebChatAPIContextType[] = [];
    const dl = createPostingDirectLine(calls);
    const steps: unknown[] = [];
    let numRenders = 0;
    let suggestedActions: readonly unknown[] = [];

    setInternalDefaultModeEnabled(mode === 'default');

    const SuggestedActionsProbe = memo(() => {
      [suggestedActions] = useSuggestedActions();
      numRenders++;

      return null;
    });

    const result = render(
      <Composer directLine={dl.directLine} userID="u-1" username="User">
        {(context: WebChatAPIContextType) => {
          contexts.push(context);

          return <SuggestedActionsProbe />;
        }}
      </Composer>
    );

    const step = async (label: string, fn?: () => void) => {
      act(() => {
        fn?.();
      });

      await flush();

      steps.push({ label, numActions: suggestedActions.length, renders: numRenders });
      numRenders = 0;
    };

    const clear = () => contexts.at(-1).clearSuggestedActions();

    await step('mount, online');
    await step('clear with nothing to clear', clear);
    await step('clear again', clear);
    await step('bot message with suggested actions', () =>
      dl.emitActivity({
        from: { id: 'bot', role: 'bot' },
        id: 'b1',
        suggestedActions: { actions: [{ title: 'Hi', type: 'imBack', value: 'Hi' }] },
        text: 'Hello',
        timestamp: new Date(500).toISOString(),
        type: 'message'
      })
    );
    await step('clear', clear);
    await step('clear again, nothing to clear', clear);
    await step('clear a third time', clear);
    await step('unmount', () => result.unmount());

    return steps;
  }

  test('clearSuggestedActions() should re-render as in Redux mode, not when already cleared', async () => {
    const redux = await runClearScript('redux');

    jest.clearAllMocks();

    const defaultMode = await runClearScript('default');

    expect(defaultMode).toEqual(redux);
    expect(getReduxCalls()).toEqual([]);

    // What it shows, to read the comparison: a clear re-renders once, then not again (the origin and the actions of a
    // set are 2 updates, outside a batch, in both modes).
    expect(defaultMode.map(({ label, renders }: any) => [label, renders])).toEqual([
      ['mount, online', expect.any(Number)],
      ['clear with nothing to clear', 1],
      ['clear again', 0],
      ['bot message with suggested actions', 2],
      ['clear', 1],
      ['clear again, nothing to clear', 0],
      ['clear a third time', 0],
      ['unmount', 0]
    ]);
  });
});

describe('speech and voice with the default providers', () => {
  async function flush() {
    for (let index = 0; index < 20; index++) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.resolve();
    }
  }
  // The same script in each mode, through the public hooks and <Composer>: a spoken bot message expecting input, the
  // end of its speech, the dictation (as <Dictation> calls the hooks), a card action while the dictation will start,
  // typing while speaking, then speech-to-speech (a handler, start, audio, mute, stop, a voice post).
  async function runSpeechScript(mode: 'default' | 'redux') {
    const calls: string[] = [];
    const clock = lolex.createClock();
    const contexts: WebChatAPIContextType[] = [];
    const activityObservers = new Set<{ next?: (value: unknown) => void }>();
    const posts: { activity: any; observer?: any }[] = [];
    const renders: unknown[] = [];
    const steps: unknown[] = [];
    const voice: {
      postVoiceActivity?: (activity: WebChatActivity) => void;
      registerVoiceHandler?: (handler: any) => () => void;
      setMuted?: (muted: boolean) => void;
    } = {};

    setInternalDefaultModeEnabled(mode === 'default');

    const directLine = {
      activity$: {
        subscribe: (observer: { next?: (value: unknown) => void }) => {
          activityObservers.add(observer);

          return { unsubscribe: () => activityObservers.delete(observer) };
        }
      },
      connectionStatus$: {
        subscribe: (observer: { next?: (value: unknown) => void }) => {
          observer.next?.(2);

          return { unsubscribe: () => undefined };
        }
      },
      end: () => calls.push('end()'),
      postActivity: (activity: any) => {
        const post: { activity: any; observer?: any } = { activity };
        const n = posts.push(post);

        calls.push(`postActivity#${n}(${activity.type}:${activity.text ?? activity.name ?? ''})`);

        return {
          subscribe: (observer: any) => {
            post.observer = observer;

            return { unsubscribe: () => calls.push(`post#${n}.unsubscribe`) };
          }
        };
      },
      setUserId: () => undefined
    };

    const emitActivity = (activity: unknown) =>
      Array.from(activityObservers).forEach(observer => observer.next?.(activity));

    const HookProbe = memo(() => {
      const [activities] = useActivities();
      const [dictateInterims] = useDictateInterims();
      const [dictateState] = useDictateState();
      const [sendBoxValue] = useSendBoxValue();
      const [shouldSpeakIncomingActivity] = useShouldSpeakIncomingActivity();
      const [suggestedActions] = useSuggestedActions();

      renders.push({
        activities: activities.map(({ channelData, id, text, type }: any) => ({
          id,
          sendStatus: channelData?.['webchat:send-status'],
          speak: channelData?.speak,
          text,
          type
        })),
        dictateInterims,
        dictateState,
        sendBoxValue,
        shouldSpeakIncomingActivity,
        suggestedActions: suggestedActions.length
      });

      return null;
    });

    const VoiceProbe = memo(() => {
      const [microphoneMuted, setMuted] = useVoiceRecordingMuted();
      const [voiceHandlers] = useVoiceHandlers();
      const [voiceState] = useVoiceState();

      voice.postVoiceActivity = usePostVoiceActivity();
      voice.registerVoiceHandler = useRegisterVoiceHandler();
      voice.setMuted = setMuted;

      renders.push({ microphoneMuted, voiceHandlers: voiceHandlers.size, voiceState });

      return null;
    });

    const result = render(
      <Composer directLine={directLine} ponyfill={{ ...clock }} sendTypingIndicator={true} userID="u-1" username="User">
        {(context: WebChatAPIContextType) => {
          contexts.push(context);

          return (
            <React.Fragment>
              <HookProbe />
              <VoiceProbe />
            </React.Fragment>
          );
        }}
      </Composer>
    );

    const step = async (label: string, fn?: () => void) => {
      act(() => {
        fn?.();
      });

      await flush();

      steps.push({ calls: calls.splice(0), label, renders: renders.splice(0) });
    };

    const context = () => contexts.at(-1);
    const sendAll = () =>
      posts.forEach(({ activity, observer }, index) => {
        observer?.next(`a${index + 1}`);
        activity.type === 'message' &&
          emitActivity({ ...activity, id: `a${index + 1}`, timestamp: new Date((index + 1) * 1_000).toISOString() });
      });
    const botMessage = (id: string, inputHint: string, extra: Record<string, unknown> = {}) => ({
      from: { id: 'bot', role: 'bot' },
      id,
      inputHint,
      text: id,
      timestamp: new Date(500).toISOString(),
      type: 'message',
      ...extra
    });

    await step('mount, online');
    await step('speak incoming', () => context().startSpeakingActivity());
    await step('bot expecting input, with suggested actions', () =>
      emitActivity(
        botMessage('b1', 'expectingInput', {
          suggestedActions: { actions: [{ title: 'Hi', type: 'imBack', value: 'Hi' }] }
        })
      )
    );
    await step('speech ends', () => context().markActivity({ id: 'b1' }, 'speak', false));
    await step('dictating', () => {
      context().setDictateInterims(['hel']);
      context().setDictateState(3);
    });
    await step('recognized', () => {
      context().setDictateInterims([]);
      context().setSendBox('hello');
      context().submitSendBox('speech');
      context().startSpeakingActivity();
    });
    await step('return, echo', sendAll);
    await step('dictation ends', () => {
      context().setDictateState(0);
      context().stopDictate();
    });
    await step('bot expecting input again', () => emitActivity(botMessage('b2', 'expectingInput')));
    await step('card action while will start', () =>
      context().onCardAction({ title: 'card', type: 'imBack', value: 'card' })
    );
    await step('speech ends again', () => context().markActivity({ id: 'b2' }, 'speak', false));
    await step('speak incoming, bot accepting input', () => {
      context().startSpeakingActivity();
      emitActivity(botMessage('b3', 'acceptingInput'));
    });
    await step('t=5000, type while speaking', () => {
      clock.tick(5_000);
      context().setSendBox('typed');
    });
    await step('microphone button: start dictate', () => {
      context().stopSpeakingActivity();
      context().startDictate();
    });
    await step('ignoring input stops the dictation', () => emitActivity(botMessage('b4', 'ignoringInput')));

    const handlerCalls: string[] = [];
    let unregister: () => void;

    await step('register a voice handler', () => {
      unregister = voice.registerVoiceHandler({
        queueAudio: (content: string) => handlerCalls.push(`queueAudio(${content})`),
        stopAllAudio: () => handlerCalls.push('stopAllAudio()')
      });
    });
    await step('start voice', () => context().startVoice());
    await step('audio, then user speaking', () => {
      emitActivity({
        from: { id: 'bot', role: 'bot' },
        name: 'media.chunk',
        type: 'event',
        value: { content: 'AAAA' },
        valueType: 'azure.directline.audio.chunk'
      });
      emitActivity({
        from: { id: 'bot', role: 'bot' },
        name: 'request.update',
        type: 'event',
        value: { state: 'detected' },
        valueType: 'azure.directline.audio.state'
      });
    });
    await step('voice post, mute', () => {
      voice.postVoiceActivity({ name: 'media.chunk', type: 'event', value: { content: 'BBBB' } } as any);
      voice.setMuted(true);
    });
    await step('stop voice', () => context().stopVoice());
    await step('unregister', () => unregister());
    await step('unmount', () => result.unmount());

    return { handlerCalls, steps };
  }

  test('should show the same as Redux mode, with the same renders and calls to Direct Line', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const redux = await runSpeechScript('redux');

      jest.clearAllMocks();

      const defaultMode = await runSpeechScript('default');

      expect(defaultMode).toEqual(redux);
      expect(getReduxCalls()).toEqual([]);
      // No placeholder, no "for tests only": no warning at all.
      expect(warn).not.toHaveBeenCalled();

      // What it shows, to read the comparison: the number of renders of each step, and the dictate states.
      expect(
        defaultMode.steps.map(({ label, renders }: any) => [
          label,
          renders.length,
          renders.filter(render => 'dictateState' in render).map(({ dictateState }) => dictateState)
        ])
      ).toEqual([
        ['mount, online', 2, [0]],
        ['speak incoming', 1, [0]],
        // Received, marked, suggested actions (actions, origin), then "will start".
        ['bot expecting input, with suggested actions', 5, [0, 0, 0, 0, 1]],
        ['speech ends', 1, [2]],
        ['dictating', 1, [3]],
        ['recognized', 1, [3]],
        ['return, echo', 2, [3, 3]],
        ['dictation ends', 1, [0]],
        ['bot expecting input again', 3, [0, 0, 1]],
        ['card action while will start', 1, [0]],
        ['speech ends again', 1, [0]],
        ['speak incoming, bot accepting input', 3, [0, 0, 0]],
        ['t=5000, type while speaking', 1, [0]],
        ['microphone button: start dictate', 1, [2]],
        ['ignoring input stops the dictation', 2, [2, 4]],
        // The handlers change stopVoice() of <Composer>: every reader of its context renders, in both modes.
        ['register a voice handler', 2, [4]],
        ['start voice', 1, []],
        ['audio, then user speaking', 1, []],
        ['voice post, mute', 1, []],
        ['stop voice', 1, []],
        ['unregister', 2, [4]],
        ['unmount', 0, []]
      ]);
      expect(defaultMode.handlerCalls).toEqual(['queueAudio(AAAA)', 'stopAllAudio()', 'stopAllAudio()']);
    } finally {
      error.mockRestore();
    }
  });
});
