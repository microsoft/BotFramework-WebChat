/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />
/* eslint-disable security/detect-object-injection */

import { act, render } from '@testing-library/react';
import {
  muteVoiceRecording,
  postVoiceActivity,
  registerVoiceHandler,
  setVoiceState,
  unmuteVoiceRecording,
  unregisterVoiceHandler,
  type VoiceHandler,
  type VoiceState,
  type WebChatActivity
} from 'botframework-webchat-core';
import React, {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactElement,
  type ReactNode
} from 'react';
import { applyMiddleware, legacy_createStore as createStore, type Store } from 'redux';

import WebChatAPIContext, { type WebChatAPIContextType } from '../../hooks/internal/WebChatAPIContext';
import { useDispatch, useWebChatReduxContext } from '../../hooks/internal/WebChatReduxContext';
import WebChatReduxProvider from '../../hooks/internal/WebChatReduxProvider';
import usePostVoiceActivity from '../../hooks/internal/usePostVoiceActivity';
import useRegisterVoiceHandler from '../../hooks/internal/useRegisterVoiceHandler';
import useVoiceHandlers from '../../hooks/internal/useVoiceHandlers';
import useVoiceStateWritable from '../../hooks/internal/useVoiceStateWritable';
import useWebChatAPIContext from '../../hooks/internal/useWebChatAPIContext';
import useConnectivityStatus from '../../hooks/useConnectivityStatus';
import useDictateInterims from '../../hooks/useDictateInterims';
import useDictateState from '../../hooks/useDictateState';
import useNotifications from '../../hooks/useNotifications';
import useReferenceGrammarID from '../../hooks/useReferenceGrammarID';
import useSendBoxAttachments from '../../hooks/useSendBoxAttachments';
import useSendBoxValue from '../../hooks/useSendBoxValue';
import useSendTypingIndicator from '../../hooks/useSendTypingIndicator';
import useShouldSpeakIncomingActivity from '../../hooks/useShouldSpeakIncomingActivity';
import useVoiceRecordingMuted from '../../hooks/useVoiceRecordingMuted';
import randomId from '../../utils/randomId';
import ReduxDomainBridge from './ReduxDomainBridge';

// Every hook switched from Redux to a domain context must re-render exactly as its implementation before the switch:
// same values, same number of renders, and setters that change identity at the same renders.
// Both implementations run side by side under one store and one sequence of actions.

// #region Implementations before the switch, verbatim

function increment(value: number): number {
  return value + 1;
}

function refEquality<T>(x: T, y: T): boolean {
  return x === y;
}

// `useSelector()` of `WebChatReduxContext.ts` at 25d812243.
function useSelector<T>(selector: (state: any) => T, equalityFn: (x: T, y: T) => boolean = refEquality): T {
  const { store, subscribe } = useWebChatReduxContext();
  const [, forceRender] = useReducer(increment, 0);
  const latestRef = useRef<
    | {
        readonly equalityFn: (x: T, y: T) => boolean;
        readonly selector: (state: any) => T;
        readonly value: T;
      }
    | undefined
  >();

  const nextValue = selector(store.getState());

  const value =
    latestRef.current && equalityFn(latestRef.current.value, nextValue) ? latestRef.current.value : nextValue;

  useLayoutEffect(() => {
    latestRef.current = Object.freeze({ equalityFn, selector, value });
  });

  useLayoutEffect(() => {
    const handleChange = () => {
      const { current } = latestRef;

      try {
        const nextValue = current.selector(store.getState());

        if (current.equalityFn(current.value, nextValue)) {
          return;
        }

        latestRef.current = Object.freeze({ ...current, value: nextValue });
      } catch {
        // Re-renders to throw the error from the selector.
      }

      forceRender();
    };

    handleChange();

    return subscribe(handleChange);
  }, [forceRender, latestRef, store, subscribe]);

  return value;
}

const LEGACY_HOOKS: Readonly<Record<string, () => unknown>> = {
  useConnectivityStatus: () => [useSelector(({ connectivityStatus }) => connectivityStatus)],
  useDictateInterims: () => [
    useSelector(({ dictateInterims }) => dictateInterims) || [],
    useWebChatAPIContext().setDictateInterims
  ],
  useDictateState: () => [useSelector(({ dictateState }) => dictateState)],
  useNotifications: () => [useSelector(({ notifications }) => notifications)],
  usePostVoiceActivity: function usePostVoiceActivity() {
    const dispatch = useDispatch();

    return useCallback(
      (activity: WebChatActivity) => {
        dispatch(postVoiceActivity(activity));
      },
      [dispatch]
    );
  },
  useReferenceGrammarID: () => [useSelector(({ referenceGrammarID }) => referenceGrammarID)],
  useRegisterVoiceHandler: function useRegisterVoiceHandler() {
    const dispatch = useDispatch();

    return useCallback(
      (voiceHandler: VoiceHandler) => {
        const id = randomId();
        dispatch(registerVoiceHandler(id, voiceHandler));
        return () => {
          dispatch(unregisterVoiceHandler(id));
        };
      },
      [dispatch]
    );
  },
  useSendBoxAttachments: function useSendBoxAttachments() {
    const sendBoxAttachments = useSelector(({ sendBoxAttachments }) => sendBoxAttachments);
    const { setSendBoxAttachments } = useWebChatAPIContext();

    return useMemo(
      () => Object.freeze([sendBoxAttachments, setSendBoxAttachments]),
      [sendBoxAttachments, setSendBoxAttachments]
    );
  },
  useSendBoxValue: () => [useSelector(({ sendBoxValue }) => sendBoxValue), useWebChatAPIContext().setSendBox],
  useSendTypingIndicator: () => [useSelector(({ sendTypingIndicator }) => sendTypingIndicator)],
  useShouldSpeakIncomingActivity: function useShouldSpeakIncomingActivity() {
    const { startSpeakingActivity, stopSpeakingActivity } = useWebChatAPIContext();

    return [
      useSelector(({ shouldSpeakIncomingActivity }) => shouldSpeakIncomingActivity),
      useCallback(
        value => {
          value ? startSpeakingActivity() : stopSpeakingActivity();
        },
        [startSpeakingActivity, stopSpeakingActivity]
      )
    ];
  },
  useVoiceHandlers: () => Object.freeze([useSelector(state => state.voice.voiceHandlers)]),
  useVoiceRecordingMuted: function useVoiceRecordingMuted() {
    const dispatch = useDispatch();
    const value = useSelector(({ voice }) => voice.microphoneMuted);

    const setter = useCallback(
      (muted: boolean) => {
        dispatch(muted ? muteVoiceRecording() : unmuteVoiceRecording());
      },
      [dispatch]
    );

    return Object.freeze([value, setter]);
  },
  useVoiceStateWritable: function useVoiceStateWritable() {
    const dispatch = useDispatch();
    const setter = useCallback(
      (state: VoiceState) => {
        dispatch(setVoiceState(state));
      },
      [dispatch]
    );
    const value = useSelector(({ voice }) => voice.voiceState);
    return Object.freeze([value, setter]);
  }
};

// #endregion

const HOOKS: Readonly<Record<keyof typeof LEGACY_HOOKS, () => unknown>> = {
  useConnectivityStatus,
  useDictateInterims,
  useDictateState,
  useNotifications,
  usePostVoiceActivity,
  useReferenceGrammarID,
  useRegisterVoiceHandler,
  useSendBoxAttachments,
  useSendBoxValue,
  useSendTypingIndicator,
  useShouldSpeakIncomingActivity,
  useVoiceHandlers,
  useVoiceRecordingMuted,
  useVoiceStateWritable
};

// Renders of each hook in `runActions()`, pinned so a change on both sides is noticed too.
const NUM_RENDERS: Readonly<Record<keyof typeof LEGACY_HOOKS, number>> = {
  useConnectivityStatus: 5,
  useDictateInterims: 5,
  useDictateState: 4,
  useNotifications: 4,
  usePostVoiceActivity: 2,
  useReferenceGrammarID: 4,
  useRegisterVoiceHandler: 2,
  useSendBoxAttachments: 4,
  useSendBoxValue: 5,
  useSendTypingIndicator: 4,
  useShouldSpeakIncomingActivity: 4,
  useVoiceHandlers: 4,
  useVoiceRecordingMuted: 4,
  useVoiceStateWritable: 4
};

type State = {
  readonly connectivityStatus: string;
  readonly dictateInterims: readonly string[] | undefined;
  readonly dictateState: number;
  readonly notifications: Readonly<Record<string, unknown>>;
  readonly other: number;
  readonly referenceGrammarID: string | undefined;
  readonly sendBoxAttachments: readonly unknown[];
  readonly sendBoxValue: string;
  readonly sendTypingIndicator: boolean;
  readonly shouldSpeakIncomingActivity: boolean;
  readonly voice: {
    readonly microphoneMuted: boolean;
    readonly voiceHandlers: ReadonlyMap<string, unknown>;
    readonly voiceState: string;
  };
};

const INITIAL_STATE: State = Object.freeze({
  connectivityStatus: 'uninitialized',
  dictateInterims: Object.freeze([]),
  dictateState: 0,
  notifications: Object.freeze({}),
  other: 0,
  referenceGrammarID: undefined,
  sendBoxAttachments: Object.freeze([]),
  sendBoxValue: '',
  sendTypingIndicator: false,
  shouldSpeakIncomingActivity: false,
  voice: Object.freeze({ microphoneMuted: false, voiceHandlers: new Map(), voiceState: 'idle' })
});

type TestAction =
  | { readonly payload: Partial<State>; readonly type: 'TEST/SET' }
  | { readonly payload: Partial<State['voice']>; readonly type: 'TEST/SET_VOICE' }
  | { readonly type: string };

function reducer(state: State = INITIAL_STATE, action: TestAction): State {
  return action.type === 'TEST/SET' && 'payload' in action
    ? { ...state, ...(action.payload as Partial<State>) }
    : action.type === 'TEST/SET_VOICE' && 'payload' in action
      ? { ...state, voice: { ...state.voice, ...(action.payload as Partial<State['voice']>) } }
      : state;
}

function createTestStore(initialState: Partial<State> = {}): Store<State, TestAction> & {
  readonly actions: TestAction[];
} {
  const actions: TestAction[] = [];

  return Object.assign(
    createStore(
      reducer,
      { ...INITIAL_STATE, ...initialState },
      applyMiddleware(() => next => action => {
        actions.push(action as TestAction);

        return next(action);
      })
    ),
    { actions }
  );
}

const set = (payload: Partial<State>): TestAction => ({ payload, type: 'TEST/SET' });
const setVoice = (payload: Partial<State['voice']>): TestAction => ({ payload, type: 'TEST/SET_VOICE' });

const API_CONTEXT = Object.freeze({
  activityStatusRenderer: jest.fn(),
  setDictateInterims: jest.fn(),
  setSendBox: jest.fn(),
  setSendBoxAttachments: jest.fn(),
  startSpeakingActivity: jest.fn(),
  stopSpeakingActivity: jest.fn(),
  uiState: undefined
} satisfies WebChatAPIContextType);

type Renders = unknown[];

function noop() {
  // Nothing to check.
}

function RenderRecorder({ renders, useHook }: { readonly renders: Renders; readonly useHook: () => unknown }) {
  renders.push(useHook());

  return null;
}

const Probe = memo(RenderRecorder);

function Providers({ children, store }: { readonly children?: ReactNode; readonly store: Store }) {
  return (
    <WebChatReduxProvider store={store}>
      <ReduxDomainBridge>
        <WebChatAPIContext.Provider value={API_CONTEXT}>{children}</WebChatAPIContext.Provider>
      </ReduxDomainBridge>
    </WebChatReduxProvider>
  );
}

// Functions differ between both implementations: only whether they kept their identity is compared.
function withoutFunctions(value: unknown): unknown {
  return typeof value === 'function' ? '(function)' : Array.isArray(value) ? value.map(withoutFunctions) : value;
}

// Describes the renders of a hook: the values, and whether each value (and the returned tuple) kept its identity.
function describeRenders(renders: Renders): unknown[] {
  return renders.map((result, index) => {
    const prev = renders[index - 1];
    const elements = Array.isArray(result) ? result : [result];
    const prevElements = Array.isArray(prev) ? prev : [prev];

    return {
      elements: elements.map((element, elementIndex) =>
        typeof element === 'function'
          ? { function: true, sameAsPrevious: index > 0 && element === prevElements[elementIndex] }
          : {
              sameAsPrevious: index > 0 && Object.is(element, prevElements[elementIndex]),
              value: withoutFunctions(element)
            }
      ),
      sameAsPrevious: index > 0 && result === prev
    };
  });
}

// Runs one sequence of actions on a tree, calling `check()` after each step.
function runActions(renderTree: (store: Store) => ReactElement, check: () => void = noop): void {
  const store = createTestStore();
  const store2 = createTestStore({ connectivityStatus: 'connected', sendBoxValue: 'store 2' });
  const result = render(renderTree(store));

  check();

  // Every slice, one at a time, outside of act(): the batched subscription renders synchronously.
  for (const action of [
    set({ connectivityStatus: 'connecting' }),
    set({ referenceGrammarID: 'grammar-1' }),
    set({ notifications: Object.freeze({ a: { alt: 'A', id: 'a', level: 'info' } }) }),
    set({ sendBoxValue: 'Hello' }),
    set({ sendBoxAttachments: Object.freeze([{ blob: new Blob(['x']) }]) }),
    set({ sendTypingIndicator: true }),
    set({ dictateInterims: undefined }),
    set({ dictateInterims: Object.freeze(['Hel']) }),
    set({ dictateState: 2 }),
    set({ shouldSpeakIncomingActivity: true }),
    setVoice({ microphoneMuted: true }),
    setVoice({ voiceHandlers: new Map() }),
    setVoice({ voiceState: 'listening' }),

    // A slice that no hook reads.
    set({ other: 1 }),

    // An action that the reducer ignores.
    { type: 'TEST/IGNORED' }
  ]) {
    store.dispatch(action);
    check();
  }

  // The same values again: a new state, but every slice keeps its identity.
  store.dispatch(set({ ...store.getState() }));
  check();

  // Many actions in one batch.
  act(() => {
    store.dispatch(set({ connectivityStatus: 'connected', sendBoxValue: 'Hello, World!' }));
    store.dispatch(set({ notifications: Object.freeze({}), referenceGrammarID: 'grammar-2' }));
    store.dispatch(set({ sendBoxAttachments: Object.freeze([]), sendTypingIndicator: false }));
    store.dispatch(set({ dictateInterims: Object.freeze([]), dictateState: 0 }));
    store.dispatch(set({ shouldSpeakIncomingActivity: false }));
    store.dispatch(setVoice({ microphoneMuted: false, voiceHandlers: new Map(), voiceState: 'idle' }));
  });

  check();

  // Swapping the store.
  result.rerender(renderTree(store2));
  check();

  // Only the new store is followed.
  store.dispatch(set({ connectivityStatus: 'error', sendBoxValue: 'old store' }));
  check();

  store2.dispatch(set({ connectivityStatus: 'error', sendBoxValue: 'new store' }));
  check();

  result.unmount();
}

describe.each(Object.keys(HOOKS))('%s()', name => {
  const useLegacyHook = LEGACY_HOOKS[name];
  const useHook = HOOKS[name];

  function expectSameRenders(legacyRenders: Renders, renders: Renders) {
    expect(renders).toHaveLength(legacyRenders.length);
    expect(describeRenders(renders)).toEqual(describeRenders(legacyRenders));

    // The values are the same objects, read from the same store (`useDictateInterims()` makes a new empty array).
    renders.forEach((result, index) =>
      (Array.isArray(result) ? result : [result]).forEach((element, elementIndex) => {
        const legacyElement = (legacyRenders[index] as unknown[])[elementIndex];

        typeof element === 'function' ||
          (Array.isArray(element) && !element.length && Array.isArray(legacyElement) && !legacyElement.length) ||
          expect(Object.is(element, legacyElement)).toBe(true);
      })
    );
  }

  test('should render the same values, as many times, as the implementation before', () => {
    const legacyRenders: Renders = [];
    const renders: Renders = [];

    runActions(
      store => (
        <Providers store={store}>
          <Probe renders={legacyRenders} useHook={useLegacyHook} />
          <Probe renders={renders} useHook={useHook} />
        </Providers>
      ),
      () => expectSameRenders(legacyRenders, renders)
    );

    expect(renders).toHaveLength(NUM_RENDERS[name]);
  });

  test('should re-render in the same batch as the implementation before', () => {
    // A child reads the hook and receives the value of its parent as a prop, as in the spec of <WebChatReduxProvider>.
    // Mixing both implementations must render the child as often, and with the same values, as with the one before.
    function runParentChild(useParentHook: () => unknown, useChildHook: () => unknown): Renders {
      const renders: Renders = [];

      const Child = memo(({ fromParent }: { readonly fromParent: unknown }) => {
        renders.push([fromParent, useChildHook()]);

        return null;
      });

      function Parent() {
        return <Child fromParent={useParentHook()} />;
      }

      runActions(store => (
        <Providers store={store}>
          <Parent />
        </Providers>
      ));

      return renders;
    }

    const legacyRenders = describeRenders(runParentChild(useLegacyHook, useLegacyHook));

    expect(describeRenders(runParentChild(useLegacyHook, useHook))).toEqual(legacyRenders);
    expect(describeRenders(runParentChild(useHook, useLegacyHook))).toEqual(legacyRenders);
  });

  test('should render the same when the value changes between render and subscription', () => {
    const legacyRenders: Renders = [];
    const renders: Renders = [];
    const store = createTestStore();

    function DispatchOnRender() {
      useMemo(() => store.dispatch(set({ connectivityStatus: 'connecting', sendBoxValue: 'during render' })), []);

      return null;
    }

    render(
      <Providers store={store}>
        <Probe renders={legacyRenders} useHook={useLegacyHook} />
        <Probe renders={renders} useHook={useHook} />
        <DispatchOnRender />
      </Providers>
    );

    expectSameRenders(legacyRenders, renders);
  });
});

// Hooks whose setters dispatch by themselves (the others return setters of WebChatAPIContext, filled by <Composer>).
const SETTER_CALLS: Readonly<Record<string, (result: unknown) => void>> = {
  usePostVoiceActivity: (postVoiceActivity: (activity: WebChatActivity) => void) =>
    postVoiceActivity({ from: { id: 'u' }, name: 'dtmf', type: 'event' } as WebChatActivity),
  useRegisterVoiceHandler: (register: (voiceHandler: VoiceHandler) => () => void) =>
    register({ queueAudio: jest.fn(), stopAllAudio: jest.fn() } as unknown as VoiceHandler)(),
  useVoiceRecordingMuted: ([, setMuted]: [boolean, (muted: boolean) => void]) => {
    setMuted(true);
    setMuted(false);
  },
  useVoiceStateWritable: ([, setVoiceState]: [VoiceState, (state: VoiceState) => void]) => setVoiceState('listening')
};

describe.each(Object.keys(SETTER_CALLS))('setters of %s()', name => {
  test('should dispatch the same actions as the implementation before', () => {
    const legacyRenders: Renders = [];
    const renders: Renders = [];
    const store = createTestStore();

    render(
      <Providers store={store}>
        <Probe renders={legacyRenders} useHook={LEGACY_HOOKS[name]} />
        <Probe renders={renders} useHook={HOOKS[name]} />
      </Providers>
    );

    // Voice handlers are registered under a random ID.
    const callAndGetActions = (result: unknown) => {
      store.actions.splice(0);
      SETTER_CALLS[name](result);

      return store.actions.map(action =>
        JSON.parse(JSON.stringify(action, (key, value) => (key === 'id' && typeof value === 'string' ? 'ID' : value)))
      );
    };

    const legacyActions = callAndGetActions(legacyRenders.at(-1));

    expect(legacyActions.length).toBeGreaterThan(0);
    expect(callAndGetActions(renders.at(-1))).toEqual(legacyActions);
  });
});
