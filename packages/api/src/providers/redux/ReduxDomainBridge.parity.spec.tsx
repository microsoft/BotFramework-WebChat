/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />
/* eslint-disable security/detect-object-injection */

import { act, render } from '@testing-library/react';
import { ReduxStoreComposer, useSuggestedActionsHooks } from '@msinternal/botframework-webchat-redux-store';
import {
  CLEAR_SUGGESTED_ACTIONS,
  clearSuggestedActions,
  createStore as createWebChatStore,
  SET_SUGGESTED_ACTIONS,
  setSuggestedActions,
  setSuggestedActionsActionSchema,
  muteVoiceRecording,
  postVoiceActivity,
  registerVoiceHandler,
  setVoiceState,
  unmuteVoiceRecording,
  unregisterVoiceHandler,
  type DirectLineCardAction,
  type VoiceHandler,
  type VoiceState,
  type WebChatActivity
} from 'botframework-webchat-core';
import { setRawState } from 'botframework-webchat-core/internal.js';
import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction
} from 'react';
import { applyMiddleware, legacy_createStore as createStore, type Action, type Store } from 'redux';
import { safeParse } from 'valibot';

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

// The hooks that read a slice context (`createSliceContext()`), filled by the bridge from one subscription.
const SLICE_CONTEXT_HOOKS: ReadonlySet<string> = new Set([
  'useConnectivityStatus',
  'useNotifications',
  'useReferenceGrammarID',
  'useSendBoxAttachments',
  'useSendBoxValue',
  'useSendTypingIndicator',
  'useDictateInterims',
  'useDictateState',
  'useShouldSpeakIncomingActivity',
  'useVoiceHandlers',
  'useVoiceRecordingMuted',
  'useVoiceStateWritable'
]);

// Renders of each hook in `runActions()`, pinned so a change on both sides is noticed too.
const NUM_RENDERS: Readonly<Record<keyof typeof LEGACY_HOOKS, number>> = {
  useConnectivityStatus: 4,
  useDictateInterims: 5,
  useDictateState: 3,
  useNotifications: 4,
  usePostVoiceActivity: 2,
  useReferenceGrammarID: 4,
  useRegisterVoiceHandler: 2,
  useSendBoxAttachments: 4,
  useSendBoxValue: 5,
  useSendTypingIndicator: 3,
  useShouldSpeakIncomingActivity: 3,
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

  function expectSameRenders(allLegacyRenders: Renders, renders: Renders) {
    // The hooks of the slice contexts read the value of their slice only: when the store is swapped and their slice keeps
    // its value, they do not re-render, where the implementation before re-rendered with the same result (it read the
    // store from a context). Those renders of the implementation before are not expected.
    const legacyRenders = SLICE_CONTEXT_HOOKS.has(name)
      ? allLegacyRenders.filter(
          (result, index) =>
            !index ||
            !Array.isArray(result) ||
            !result.every((element, elementIndex) =>
              Object.is(element, (allLegacyRenders[index - 1] as unknown[])[+elementIndex])
            )
        )
      : allLegacyRenders;

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

// #region <SuggestedActionsComposer> at 25d812243, verbatim (without prop validation): the context held a hook.

const EMPTY_ARRAY = Object.freeze([]);

type LegacySuggestedActionsContextType = Readonly<{
  useSuggestedActions: () => readonly [
    readonly DirectLineCardAction[],
    Dispatch<SetStateAction<readonly DirectLineCardAction[]>>,
    Readonly<{ activity: undefined | WebChatActivity }>
  ];
}>;

const LegacySuggestedActionsContext = createContext<LegacySuggestedActionsContextType>(
  new Proxy({} as LegacySuggestedActionsContextType, {
    get() {
      throw new Error('botframework-webchat: This hook can only be used under <SuggestedActionsContext>');
    }
  })
);

function LegacySuggestedActionsComposerImpl({
  children,
  store: { dispatch }
}: {
  readonly children: ReactNode;
  readonly store: Store;
}) {
  const [originActivity, setOriginActivity] = useState<WebChatActivity | undefined>();
  const [suggestedActions, setSuggestedActionsRaw] = useState<readonly DirectLineCardAction[]>(EMPTY_ARRAY);
  const setSuggestedActions = useCallback<typeof setSuggestedActionsRaw>(
    suggestedActions => {
      setOriginActivity(undefined);
      setSuggestedActionsRaw(suggestedActions);
    },
    [setSuggestedActionsRaw]
  );

  // #region Replicate to Redux store
  const handleAction = useCallback(
    (action: Action) => {
      if (action.type === CLEAR_SUGGESTED_ACTIONS) {
        setOriginActivity(undefined);
        setSuggestedActionsRaw(EMPTY_ARRAY);
      } else if (action.type === SET_SUGGESTED_ACTIONS) {
        const result = safeParse(setSuggestedActionsActionSchema, action);

        if (result.success) {
          const {
            payload: { originActivity, suggestedActions }
          } = result.output;

          setOriginActivity(originActivity);
          setSuggestedActionsRaw(Object.freeze(Array.from(suggestedActions)));
        }
      }
    },
    [setOriginActivity, setSuggestedActionsRaw]
  );

  useMemo(() => dispatch(setRawState('suggestedActions', suggestedActions)), [dispatch, suggestedActions]);
  useMemo(
    () => dispatch(setRawState('suggestedActionsOriginActivity', { activity: originActivity })),
    [dispatch, originActivity]
  );

  useEffect(() => {
    dispatch({ payload: { sink: handleAction }, type: 'WEB_CHAT_INTERNAL/REGISTER_ACTION_SINK' });

    return () => {
      dispatch({ payload: { sink: handleAction }, type: 'WEB_CHAT_INTERNAL/UNREGISTER_ACTION_SINK' });
    };
  }, [dispatch, handleAction]);
  // #endregion

  const useSuggestedActions = useCallback<LegacySuggestedActionsContextType['useSuggestedActions']>(
    () => Object.freeze([suggestedActions, setSuggestedActions, Object.freeze({ activity: originActivity })]),
    [originActivity, setSuggestedActions, suggestedActions]
  );

  const context = useMemo<LegacySuggestedActionsContextType>(() => ({ useSuggestedActions }), [useSuggestedActions]);

  return <LegacySuggestedActionsContext.Provider value={context}>{children}</LegacySuggestedActionsContext.Provider>;
}

const LegacySuggestedActionsComposer = memo(LegacySuggestedActionsComposerImpl);

const useLegacySuggestedActions = () => useContext(LegacySuggestedActionsContext).useSuggestedActions();

// #endregion

// The public hooks object, read in a component as hosts do (not inside another hook).
function CurrentSuggestedActionsRecorder({ renders }: { readonly renders: Renders }) {
  renders.push(useSuggestedActionsHooks().useSuggestedActions());

  return null;
}

const CurrentSuggestedActionsProbe = memo(CurrentSuggestedActionsRecorder);

describe('useSuggestedActionsHooks().useSuggestedActions()', () => {
  const CARD_ACTIONS_1: readonly DirectLineCardAction[] = Object.freeze([
    Object.freeze({ title: 'One', type: 'imBack', value: 'One' } satisfies DirectLineCardAction)
  ]);

  const CARD_ACTIONS_2: readonly DirectLineCardAction[] = Object.freeze([
    Object.freeze({ title: 'Two', type: 'imBack', value: 'Two' } satisfies DirectLineCardAction)
  ]);

  const ORIGIN_ACTIVITY = Object.freeze({
    channelData: Object.freeze({}),
    from: Object.freeze({ id: 'bot', role: 'bot' }),
    id: 'a-1',
    type: 'message'
  }) as unknown as WebChatActivity;

  type Snapshot = {
    readonly actionTypes: readonly string[];
    readonly renders: unknown[];
    readonly suggestedActions: unknown;
    readonly suggestedActionsOriginActivity: unknown;
  };

  type SuggestedActionsState = ReturnType<ReturnType<typeof useSuggestedActionsHooks>['useSuggestedActions']>;

  // Runs one sequence of steps on a tree of one implementation, with its own stores, and records every step.
  function runSteps(
    renderTree: (store: Store, renders: Renders) => ReactElement,
    { batch = false }: { readonly batch?: boolean } = {}
  ): Snapshot[] {
    const actionTypes: string[] = [];
    const createLoggedStore = () =>
      createWebChatStore({}, () => next => (action: Action) => {
        actionTypes.push(action.type);

        return next(action);
      });

    const renders: Renders = [];
    const snapshots: Snapshot[] = [];
    const store = createLoggedStore();
    const store2 = createLoggedStore();
    let currentStore = store;

    const snap = () => {
      const { suggestedActions, suggestedActionsOriginActivity } = currentStore.getState();

      snapshots.push({
        actionTypes: actionTypes.splice(0),
        renders: describeRenders(renders),
        suggestedActions,
        suggestedActionsOriginActivity
      });
    };

    const setter = () => (renders.at(-1) as SuggestedActionsState)[1];
    const run = (fn: () => void) => (batch ? act(fn) : fn());

    const result = render(renderTree(store, renders));

    snap();

    run(() => store.dispatch(setSuggestedActions(CARD_ACTIONS_1, ORIGIN_ACTIVITY)));
    snap();

    // The same suggested actions again: a new array.
    run(() => store.dispatch(setSuggestedActions(CARD_ACTIONS_1, ORIGIN_ACTIVITY)));
    snap();

    run(() => setter()(CARD_ACTIONS_2));
    snap();

    run(() => setter()(suggestedActions => suggestedActions));
    snap();

    run(() => store.dispatch(clearSuggestedActions()));
    snap();

    run(() => store.dispatch(clearSuggestedActions()));
    snap();

    run(() => store.dispatch({ type: 'TEST/UNRELATED' }));
    snap();

    act(() => {
      store.dispatch(setSuggestedActions(CARD_ACTIONS_2, ORIGIN_ACTIVITY));
      setter()(CARD_ACTIONS_1);
      store.dispatch(setSuggestedActions(CARD_ACTIONS_1, ORIGIN_ACTIVITY));
    });
    snap();

    // A render of the parent, with the same store.
    result.rerender(renderTree(store, renders));
    snap();

    // Swapping the store.
    currentStore = store2;
    result.rerender(renderTree(store2, renders));
    snap();

    // Only the new store is followed.
    run(() => store.dispatch(clearSuggestedActions()));
    snap();

    run(() => store2.dispatch(clearSuggestedActions()));
    snap();

    result.unmount();
    snap();

    return snapshots;
  }

  const renderLegacy = (store: Store, renders: Renders) => (
    <LegacySuggestedActionsComposer store={store}>
      <Probe renders={renders} useHook={useLegacySuggestedActions} />
    </LegacySuggestedActionsComposer>
  );

  const renderCurrent = (store: Store, renders: Renders) => (
    <ReduxStoreComposer store={store}>
      <CurrentSuggestedActionsProbe renders={renders} />
    </ReduxStoreComposer>
  );

  test.each([
    ['outside of act()', false, 10],
    ['each step in act()', true, 7]
  ])(
    'should render, write to the store and dispatch as the implementation before, %s',
    (_: string, batch: boolean, numRenders: number) => {
      const legacySnapshots = runSteps(renderLegacy, { batch });
      const snapshots = runSteps(renderCurrent, { batch });

      expect(snapshots).toEqual(legacySnapshots);

      // Pinned, so a change on both sides is noticed too.
      expect(snapshots.at(-1)?.renders).toHaveLength(numRenders);
    }
  );

  test('should keep the hooks object and the setter for the lifetime of the composer', () => {
    const hooks: unknown[] = [];
    const renders: Renders = [];
    const store = createWebChatStore();

    function HooksProbe() {
      hooks.push(useSuggestedActionsHooks());
      renders.push(useSuggestedActionsHooks().useSuggestedActions());

      return null;
    }

    render(
      <ReduxStoreComposer store={store}>
        <HooksProbe />
      </ReduxStoreComposer>
    );

    act(() => {
      store.dispatch(setSuggestedActions(CARD_ACTIONS_1, ORIGIN_ACTIVITY));
    });

    expect(renders).toHaveLength(2);
    expect(hooks[1]).toBe(hooks[0]);
    expect((renders[1] as SuggestedActionsState)[1]).toBe((renders[0] as SuggestedActionsState)[1]);
    expect((renders[1] as SuggestedActionsState)[2]).toEqual({ activity: ORIGIN_ACTIVITY });
  });
});
