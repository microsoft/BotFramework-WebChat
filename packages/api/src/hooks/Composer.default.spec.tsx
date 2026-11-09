/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

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

import { setInternalDefaultModeEnabled } from '../providers/internalDefaultMode';
import Composer from './Composer';
import { type WebChatAPIContextType } from './internal/WebChatAPIContext';
import useActivities from './useActivities';
import useConnectivityStatus from './useConnectivityStatus';

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

    // Not connected: the connection is not built in the default providers yet.
    expect(directLine.activity$.subscribe).not.toHaveBeenCalled();

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
