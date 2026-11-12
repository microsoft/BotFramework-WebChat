import { GraphProvider } from '@msinternal/botframework-webchat-api-graph';
import {
  CLEARED_SUGGESTED_ACTIONS,
  SuggestedActionsComposer,
  SuggestedActionsSubscriber
} from '@msinternal/botframework-webchat-redux-store';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import {
  CLEAR_SUGGESTED_ACTIONS,
  dismissNotification,
  postActivity,
  SET_SUGGESTED_ACTIONS,
  setNotification,
  setSuggestedActionsActionSchema
} from 'botframework-webchat-core';
import {
  createActivitiesStore,
  createDefaultEngine,
  createDefaultModeReducers,
  createReducerGroup,
  getInitialState,
  incomingActivity,
  registerActionSink,
  unregisterActionSink,
  type ActivitiesStore
} from 'botframework-webchat-core/internal.js';
import React, { memo, useEffect, useMemo } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { custom, function_, is, object, optional, pipe, readonly, safeParse, unknown, type InferInput } from 'valibot';

import ConnectionSlices from '../../hooks/internal/domains/ConnectionSlices';
import DomainOperations from '../../hooks/internal/domains/DomainOperations';
import SendBoxSlices from '../../hooks/internal/domains/SendBoxSlices';
import SpeechSlices from '../../hooks/internal/domains/SpeechSlices';
import VoiceSlices from '../../hooks/internal/domains/VoiceSlices';
import useEagerReducer from '../../hooks/internal/useEagerReducer';
import usePonyfill from '../../hooks/usePonyfill';
import { countProviderMount } from '../internalDefaultMode';
import DefaultSessionEffects from './DefaultSessionEffects';
import createGraphStoreFromActivitiesStore from './private/createGraphStoreFromActivitiesStore';
import { type TestHandle } from './private/testHandles';

const defaultProvidersPropsSchema = pipe(
  object({
    /** For tests: the activities store to read, instead of one created on mount. */
    activitiesStore: optional(
      custom<ActivitiesStore>(value =>
        is(object({ getSnapshot: function_(), receiveActivity: function_(), subscribe: function_() }), value)
      )
    ),
    children: optional(reactNode()),
    // Props of <Composer>, checked by its valibot schema (`validateProps()`): not validated again, as in Redux mode.
    directLine: optional(unknown()),
    locale: optional(unknown()),
    sendTypingIndicator: optional(unknown()),
    userID: optional(unknown()),
    username: optional(unknown())
  }),
  readonly()
);

type DefaultProvidersProps = InferInput<typeof defaultProvidersPropsSchema>;

type SuggestedActionsListener = Parameters<Parameters<typeof SuggestedActionsSubscriber>[0]['subscribe']>[0];

/**
 * What `<ReduxSuggestedActionsMirror>` does with the store: the suggested actions from an action sink on the machines.
 * Also keeps the suggested actions set last, as the `suggestedActions` of the Redux store, for the test handle.
 */
function createSuggestedActionsSubscription(dispatch: (action: unknown) => unknown) {
  let lastSuggestedActions: readonly unknown[] = [];

  return Object.freeze({
    getLastSuggestedActions: () => lastSuggestedActions,
    subscribeSuggestedActions: (listener: SuggestedActionsListener) => {
      const sink = (action: { readonly type: string }) => {
        if (action.type === CLEAR_SUGGESTED_ACTIONS) {
          lastSuggestedActions = CLEARED_SUGGESTED_ACTIONS;
          listener(CLEARED_SUGGESTED_ACTIONS, undefined);
        } else if (action.type === SET_SUGGESTED_ACTIONS) {
          const result = safeParse(setSuggestedActionsActionSchema, action);

          if (result.success) {
            const {
              payload: { originActivity, suggestedActions }
            } = result.output;

            lastSuggestedActions = suggestedActions;
            listener(suggestedActions, originActivity);
          }
        }
      };

      dispatch(registerActionSink(sink as any));

      return () => {
        dispatch(unregisterActionSink(sink as any));
      };
    }
  });
}

/**
 * The providers of `<Composer>` without Redux: the reducer groups (`useEagerReducer()`) and the activities store hold
 * the state, and the default engine gives each action to them, then to the machines of Redux mode. The slice contexts
 * render the state of the groups; the domain setters dispatch to the engine, as they dispatch to the Redux store in
 * Redux mode.
 *
 * Internal: the default providers are used only when switched on for tests, until they become the default.
 */
function DefaultProviders(props: DefaultProvidersProps) {
  const {
    activitiesStore: activitiesStoreFromProps,
    children,
    directLine,
    locale,
    sendTypingIndicator,
    userID,
    username
  } = validateProps(defaultProvidersPropsSchema, props);
  const [ponyfill] = usePonyfill();

  // As the Redux store that <Composer> creates: one set per ponyfill, which cannot change after the first render.
  const reducers = useMemo(() => {
    const reducers = createDefaultModeReducers(ponyfill);

    return Object.freeze({
      connection: Object.freeze({ initialState: getInitialState(reducers.connection), reducer: reducers.connection }),
      outgoing: reducers.outgoing,
      sendBox: Object.freeze({ initialState: getInitialState(reducers.sendBox), reducer: reducers.sendBox }),
      speech: Object.freeze({ initialState: getInitialState(reducers.speech), reducer: reducers.speech }),
      voice: Object.freeze({ initialState: getInitialState(reducers.voice), reducer: reducers.voice })
    });
  }, [ponyfill]);

  // The groups that the slice contexts render. The engine below is created in the same render: under Strict Mode, the
  // engine of a discarded render dispatches to the groups of that render only.
  const [connection, dispatchConnection, getConnection] = useEagerReducer(
    reducers.connection.reducer,
    reducers.connection.initialState
  );
  const [sendBox, dispatchSendBox, getSendBox] = useEagerReducer(
    reducers.sendBox.reducer,
    reducers.sendBox.initialState
  );
  const [speech, dispatchSpeech, getSpeech] = useEagerReducer(reducers.speech.reducer, reducers.speech.initialState);
  const [{ voice }, dispatchVoice, getVoice] = useEagerReducer(reducers.voice.reducer, reducers.voice.initialState);

  const { activitiesStore, engine, subscribeSuggestedActions, testHandle } = useMemo(() => {
    const activitiesStore = activitiesStoreFromProps || createActivitiesStore({ ponyfill });
    const engine = createDefaultEngine({
      activitiesStore,
      // One action renders every group that changed once, as one dispatch to the Redux store.
      // Remove `unstable_batchedUpdates()` when every supported React renders with `createRoot()`.
      batch: unstable_batchedUpdates,
      groups: [
        { dispatch: dispatchConnection, getState: getConnection },
        // Only the machines read it (language, send timeout): no render.
        createReducerGroup(reducers.outgoing),
        { dispatch: dispatchSendBox, getState: getSendBox },
        { dispatch: dispatchSpeech, getState: getSpeech },
        { dispatch: dispatchVoice, getState: getVoice }
      ],
      ponyfill
    });

    // As the Redux store, the machines run from its creation: the mount effects of the host's children run before the
    // effects of these providers, and what they dispatch must reach the machines. Starting only registers what they wait
    // for.
    engine.start();

    const { getLastSuggestedActions, subscribeSuggestedActions } = createSuggestedActionsSubscription(engine.dispatch);

    const getState = engine.getState as () => any;

    const testHandle: TestHandle = Object.freeze({
      dismissNotification: (id: string) => {
        engine.dispatch(dismissNotification(id));
      },
      dispatch: engine.dispatch,
      getActivities: () => activitiesStore.getSnapshot().sortedActivities,
      getConnectivityStatus: () => getState().connectivityStatus,
      getDictateState: () => getState().dictateState,
      getLanguage: () => getState().language,
      getMicrophoneMuted: () => getState().voice.microphoneMuted,
      getSendBoxValue: () => getState().sendBoxValue,
      getSuggestedActions: getLastSuggestedActions,
      getVoiceState: () => getState().voice.voiceState,
      postActivity: (activity, method?: string) => {
        engine.dispatch(postActivity(activity, method));
      },
      receiveActivity: activity => {
        engine.dispatch(incomingActivity(activity));
      },
      setNotification: notification => {
        engine.dispatch(setNotification(notification as Parameters<typeof setNotification>[0]));
      }
    });

    return Object.freeze({ activitiesStore, engine, subscribeSuggestedActions, testHandle });
  }, [
    activitiesStoreFromProps,
    dispatchConnection,
    dispatchSendBox,
    dispatchSpeech,
    dispatchVoice,
    getConnection,
    getSendBox,
    getSpeech,
    getVoice,
    ponyfill,
    reducers
  ]);

  const graphStore = useMemo(() => createGraphStoreFromActivitiesStore(activitiesStore), [activitiesStore]);

  useEffect(() => {
    countProviderMount('default');
  }, []);

  return (
    <SuggestedActionsComposer>
      <SuggestedActionsSubscriber subscribe={subscribeSuggestedActions}>
        <GraphProvider store={graphStore}>
          <DomainOperations dispatch={engine.dispatch}>
            <ConnectionSlices
              connectivityStatus={connection.connectivityStatus}
              // Keyed by ID, as the `notifications` slice of the Redux store.
              notifications={connection.notifications as any}
              // As the Redux store: `null` until Direct Line has a reference grammar ID.
              referenceGrammarID={connection.referenceGrammarID}
            >
              <SendBoxSlices
                sendBoxAttachments={sendBox.sendBoxAttachments}
                sendBoxValue={sendBox.sendBoxValue}
                sendTypingIndicator={sendBox.sendTypingIndicator}
              >
                <SpeechSlices
                  dictateInterims={speech.dictateInterims}
                  dictateState={speech.dictateState}
                  shouldSpeakIncomingActivity={speech.shouldSpeakIncomingActivity}
                >
                  <VoiceSlices
                    microphoneMuted={voice.microphoneMuted}
                    voiceHandlers={voice.voiceHandlers}
                    voiceState={voice.voiceState}
                  >
                    <DefaultSessionEffects
                      directLine={directLine as any}
                      engine={engine}
                      locale={locale as string | undefined}
                      sendTypingIndicator={sendTypingIndicator as boolean | undefined}
                      testHandle={testHandle}
                      userID={userID as string | undefined}
                      username={username as string | undefined}
                    >
                      {children}
                    </DefaultSessionEffects>
                  </VoiceSlices>
                </SpeechSlices>
              </SendBoxSlices>
            </ConnectionSlices>
          </DomainOperations>
        </GraphProvider>
      </SuggestedActionsSubscriber>
    </SuggestedActionsComposer>
  );
}

DefaultProviders.displayName = 'DefaultProviders';

export default memo(DefaultProviders);
export { defaultProvidersPropsSchema, type DefaultProvidersProps };
