// The sagas, as Web Chat runs them: core's Redux store (`createStoreWithOptions()`), with all its sagas, on the clock of
// the script.
import clearSuggestedActions, { CLEAR_SUGGESTED_ACTIONS } from '../../actions/clearSuggestedActions';
import connect from '../../actions/connect';
import disconnect from '../../actions/disconnect';
import emitTypingIndicator from '../../actions/emitTypingIndicator';
import { INCOMING_ACTIVITY } from '../../actions/incomingActivity';
import markActivity from '../../actions/markActivity';
import muteVoiceRecording from '../../actions/muteVoiceRecording';
import postActivity, { POST_ACTIVITY_FULFILLED, POST_ACTIVITY_PENDING } from '../../actions/postActivity';
import postVoiceActivity from '../../actions/postVoiceActivity';
import registerVoiceHandler from '../../actions/registerVoiceHandler';
import sendEvent from '../../actions/sendEvent';
import sendFiles from '../../actions/sendFiles';
import sendMessage from '../../actions/sendMessage';
import sendMessageBack from '../../actions/sendMessageBack';
import sendPostBack from '../../actions/sendPostBack';
import setDictateInterims from '../../actions/setDictateInterims';
import setDictateState from '../../actions/setDictateState';
import setLanguage from '../../actions/setLanguage';
import setSendBox from '../../actions/setSendBox';
import setSendBoxAttachments from '../../actions/setSendBoxAttachments';
import setSendTimeout from '../../actions/setSendTimeout';
import setSendTypingIndicator from '../../actions/setSendTypingIndicator';
import { SET_SUGGESTED_ACTIONS } from '../../actions/setSuggestedActions';
import setVoiceState from '../../actions/setVoiceState';
import startDictate from '../../actions/startDictate';
import startSpeakingActivity from '../../actions/startSpeakingActivity';
import startVoiceRecording from '../../actions/startVoiceRecording';
import stopDictate from '../../actions/stopDictate';
import stopSpeakingActivity from '../../actions/stopSpeakingActivity';
import stopVoiceRecording from '../../actions/stopVoiceRecording';
import submitSendBox from '../../actions/submitSendBox';
import unmuteVoiceRecording from '../../actions/unmuteVoiceRecording';
import unregisterVoiceHandler from '../../actions/unregisterVoiceHandler';
import { withOptions } from '../../createStore';
import type { Middleware } from 'redux';
import { describeVoiceHandlers, type CreateDriver, type Observation, type Operations } from './runParityScript';

const KEYS = Object.freeze([
  'activities',
  'connectivityStatus',
  'dictateInterims',
  'dictateState',
  'microphoneMuted',
  'notifications',
  'referenceGrammarID',
  'sendBoxAttachments',
  'sendBoxValue',
  'sendTypingIndicator',
  'shouldSpeakIncomingActivity',
  'voiceHandlers',
  'voiceState'
] as const);

type RawObservation = Omit<Observation, 'voiceHandlers'> & { readonly voiceHandlers: ReadonlyMap<string, unknown> };

// The keys of the store that `observe()` reads (`voice` is `microphoneMuted`, `voiceHandlers` and `voiceState`), or
// not recorded: the graph of the activities (`activities` is its sorted list) and the ponyfill (`internal`).
const OBSERVED_STORE_KEYS: readonly string[] = Object.freeze([
  'activities',
  'connectivityStatus',
  'dictateInterims',
  'dictateState',
  'groupedActivities',
  'internal',
  'language',
  'notifications',
  'referenceGrammarID',
  'sendBoxAttachments',
  'sendBoxValue',
  'sendTypingIndicator',
  'shouldSpeakIncomingActivity',
  'voice'
]);

const createReduxDriver: CreateDriver = ({
  faults,
  host,
  onAction,
  onActionThrew,
  onChange,
  onSuggestedActions,
  ponyfill
}) => {
  let depth = 0;

  // Outermost: the actions as the first middleware of a host sees them, with how deep in other dispatches they are.
  const recorder: Middleware = () => next => action => {
    depth++;

    try {
      onAction(action, depth);

      return next(action);
    } catch (error) {
      onActionThrew(action, depth, error);

      throw error;
    } finally {
      depth--;
    }
  };

  const faulty: Middleware = () => next => (action: any) => {
    if (
      action.type === INCOMING_ACTIVITY &&
      faults.receiveThrowsFor &&
      faults.receiveThrowsFor === action.payload.activity.id
    ) {
      throw new Error(`receive ${faults.receiveThrowsFor}`);
    } else if (
      action.type === POST_ACTIVITY_PENDING &&
      faults.pendingThrowsFor &&
      faults.pendingThrowsFor === action.payload.activity.text
    ) {
      throw new Error(`pending ${faults.pendingThrowsFor}`);
    } else if (
      action.type === POST_ACTIVITY_FULFILLED &&
      faults.fulfilledThrowsFor &&
      faults.fulfilledThrowsFor === action.payload.activity.text
    ) {
      throw new Error(`fulfilled ${faults.fulfilledThrowsFor}`);
    }

    const result = next(action);

    action.type === SET_SUGGESTED_ACTIONS &&
      onSuggestedActions(action.payload.suggestedActions, action.payload.originActivity);

    // <ReduxSuggestedActionsMirror> clears the suggested actions on this action.
    action.type === CLEAR_SUGGESTED_ACTIONS && onSuggestedActions([], undefined);

    return result;
  };

  const store = withOptions(
    { ponyfill },
    undefined,
    ...[recorder, host.middleware, faulty].filter((middleware): middleware is Middleware => !!middleware)
  );

  const observeRaw = (): RawObservation => {
    const {
      activities,
      connectivityStatus,
      dictateInterims,
      dictateState,
      language,
      notifications,
      referenceGrammarID,
      sendBoxAttachments,
      sendBoxValue,
      sendTypingIndicator,
      shouldSpeakIncomingActivity,
      voice: { microphoneMuted, voiceHandlers, voiceState }
    } = store.getState();

    return {
      activities,
      connectivityStatus,
      dictateInterims,
      dictateState,
      language,
      microphoneMuted,
      notifications,
      referenceGrammarID,
      sendBoxAttachments,
      sendBoxValue,
      sendTypingIndicator,
      shouldSpeakIncomingActivity,
      voiceHandlers,
      voiceState
    };
  };

  const observe = (): Observation => {
    const raw = observeRaw();

    return { ...raw, voiceHandlers: describeVoiceHandlers(raw.voiceHandlers) };
  };

  let last = observeRaw();

  // Records first: a listener that throws stops the listeners after it.
  const unsubscribeRecorder = store.subscribe(() => {
    const next = observeRaw();

    for (const key of KEYS) {
      // eslint-disable-next-line security/detect-object-injection
      Object.is(next[key], last[key]) ||
        // eslint-disable-next-line security/detect-object-injection
        onChange(key, key === 'voiceHandlers' ? describeVoiceHandlers(next.voiceHandlers) : next[key]);
    }

    last = next;
  });

  let lastStatus = last.connectivityStatus;

  const unsubscribeFault = store.subscribe(() => {
    const { connectivityStatus } = store.getState();

    if (connectivityStatus !== lastStatus) {
      lastStatus = connectivityStatus;

      if (connectivityStatus === faults.statusListenerThrowsOn) {
        throw new Error(`listener on ${connectivityStatus}`);
      }
    }
  });

  const unsubscribeHost = host.listener ? store.subscribe(() => host.listener(store.getState)) : () => undefined;

  const { dispatch } = store;
  let numVoiceHandlers = 0;

  const ops: Operations = Object.freeze({
    clearSuggestedActions: () => dispatch(clearSuggestedActions()),
    emitTypingIndicator: () => dispatch(emitTypingIndicator()),
    markActivity: (activity, name, value) => dispatch(markActivity(activity, name, value)),
    postActivity: (activity, method) => dispatch(postActivity(activity, method)),
    postVoiceActivity: activity => dispatch(postVoiceActivity(activity)),
    // As the api: a new ID for each handler.
    registerVoiceHandler: voiceHandler => {
      const id = `v${++numVoiceHandlers}`;

      dispatch(registerVoiceHandler(id, voiceHandler));

      return () => dispatch(unregisterVoiceHandler(id));
    },
    sendEvent: (name, value) => dispatch(sendEvent(name, value)),
    sendFiles: files => dispatch(sendFiles(files)),
    sendMessage: (text, method, init) => dispatch(sendMessage(text, method, init)),
    sendMessageBack: (value, text, displayText, init) => dispatch(sendMessageBack(value, text, displayText, init)),
    sendPostBack: (value, init) => dispatch(sendPostBack(value, init)),
    setDictateInterims: dictateInterims => dispatch(setDictateInterims(dictateInterims)),
    setDictateState: dictateState => dispatch(setDictateState(dictateState)),
    setLanguage: language => dispatch(setLanguage(language)),
    setMuted: muted => dispatch(muted ? muteVoiceRecording() : unmuteVoiceRecording()),
    setSendBox: text => dispatch(setSendBox(text)),
    setSendBoxAttachments: attachments => dispatch(setSendBoxAttachments(attachments)),
    setSendTimeout: sendTimeout => dispatch(setSendTimeout(sendTimeout)),
    setSendTypingIndicator: value => dispatch(setSendTypingIndicator(value)),
    setVoiceState: voiceState => dispatch(setVoiceState(voiceState as Parameters<typeof setVoiceState>[0])),
    startDictate: () => dispatch(startDictate()),
    startSpeakingActivity: () => dispatch(startSpeakingActivity()),
    startVoice: () => dispatch(startVoiceRecording()),
    stopDictate: () => dispatch(stopDictate()),
    stopSpeakingActivity: () => dispatch(stopSpeakingActivity()),
    stopVoice: () => dispatch(stopVoiceRecording()),
    submitSendBox: (method, init) => dispatch(submitSendBox(method, init && { channelData: init.channelData }))
  });

  return Object.freeze({
    connect: ({ directLine, userID, username }) => {
      dispatch(connect({ directLine, userID: userID as string, username }));
    },
    disconnect: () => {
      dispatch(disconnect());
    },
    dispose: () => {
      unsubscribeHost();
      unsubscribeFault();
      unsubscribeRecorder();
    },
    observe,
    observeStore: () =>
      Object.fromEntries(Object.entries(store.getState()).filter(([key]) => !OBSERVED_STORE_KEYS.includes(key))),
    ops,
    rawDispatch: action => dispatch(action)
  });
};

export default createReduxDriver;
