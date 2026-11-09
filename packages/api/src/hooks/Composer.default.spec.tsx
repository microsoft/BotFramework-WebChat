/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />
/* eslint-disable no-restricted-globals */

// "No Redux in default mode": when <Composer> mounts the default providers, nothing of `redux` or `redux-saga` is
// called. Every function they export is wrapped in a mock, which core (its dist) calls through `require()`.
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
jest.mock('redux-saga', () => mockFunctionsOf('redux-saga'));

import { act, render } from '@testing-library/react';
import { createStore as createWebChatStore, type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useEffect } from 'react';
import * as redux from 'redux';
import * as reduxSaga from 'redux-saga';

import { getTestHandle } from '../providers/default/private/testHandles';
import { getProviderMountCounts, setInternalDefaultModeEnabled } from '../providers/internalDefaultMode';
import Composer from './Composer';
import { type WebChatAPIContextType } from './internal/WebChatAPIContext';
import useActivities from './useActivities';
import useConnectivityStatus from './useConnectivityStatus';
import useNotifications from './useNotifications';
import useReferenceGrammarID from './useReferenceGrammarID';
import useSuggestedActions from './useSuggestedActions';

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

// The functions of `redux` and `redux-saga` that were called, by name.
function getReduxCalls(): string[] {
  return [
    ...Object.entries(redux).map(([name, value]) => [`redux.${name}`, value] as const),
    ...Object.entries(reduxSaga).map(([name, value]) => [`redux-saga.${name}`, value] as const)
  ]
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
  test('should call nothing of redux and redux-saga with the default providers', () => {
    const directLine = createDirectLine();
    const { children, contexts, renders } = createProbe();

    setInternalDefaultModeEnabled(true);

    const result = render(<Composer directLine={directLine}>{children}</Composer>);

    // <ComposerCore> and the hooks under it rendered, without Redux.
    expect(contexts.length).toBeGreaterThan(0);
    expect(typeof contexts.at(-1)?.sendMessage).toBe('function');
    expect(renders.at(-1)).toEqual({ activities: [], connectivityStatus: 'uninitialized' });

    // Connected by the connection service, without Redux.
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

    // The spies work: core created its Redux store and saga middleware.
    expect(getReduxCalls()).toEqual(expect.arrayContaining(['redux.createStore', 'redux-saga.default']));
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
