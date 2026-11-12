// Default mode, as the api runs it without React: the reducer groups (plain objects instead of `useEagerReducer()`),
// the activities store and the machines (`createDefaultEngine()`), on the clock of the script. The actions are recorded
// as the outermost middleware of the Redux driver records them, and the faults are injected at the same place.
import { createActivitiesStore } from '@msinternal/botframework-webchat-core-activities';

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
import createDefaultEngine from '../../defaultMode/createDefaultEngine';
import createDefaultModeReducers from '../../defaultMode/createDefaultModeReducers';
import createReducerGroup from '../../defaultMode/createReducerGroup';
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

const createDefaultDriver: CreateDriver = ({
  faults,
  onAction,
  onActionThrew,
  onChange,
  onSuggestedActions,
  ponyfill
}) => {
  const reducers = createDefaultModeReducers(ponyfill);
  const groups = [
    createReducerGroup(reducers.connection),
    createReducerGroup(reducers.outgoing),
    createReducerGroup(reducers.sendBox),
    createReducerGroup(reducers.speech),
    createReducerGroup(reducers.voice)
  ];

  let depth = 0;
  // Set once the engine exists: `batch()` runs only when dispatching.
  // eslint-disable-next-line prefer-const
  let observeRaw: () => RawObservation;
  let last: RawObservation | undefined;
  let lastStatus: unknown;

  const engine = createDefaultEngine({
    activitiesStore: createActivitiesStore({ ponyfill }),
    // After the reducers, as the listeners of the Redux store: the recorder first, then the listener that may throw.
    batch: fn => {
      fn();

      const next = observeRaw();

      for (const key of KEYS) {
        // eslint-disable-next-line security/detect-object-injection
        Object.is(next[key], last[key]) ||
          // eslint-disable-next-line security/detect-object-injection
          onChange(key, key === 'voiceHandlers' ? describeVoiceHandlers(next.voiceHandlers) : next[key]);
      }

      last = next;

      if (next.connectivityStatus !== lastStatus) {
        lastStatus = next.connectivityStatus;

        if (next.connectivityStatus === faults.statusListenerThrowsOn) {
          throw new Error(`listener on ${next.connectivityStatus}`);
        }
      }
    },
    groups,
    ponyfill,
    // The recorder and the faults of the Redux driver, as one middleware: the actions as a host would see them.
    wrapDispatch: next => (action: any) => {
      depth++;

      try {
        onAction(action, depth);

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

        action.type === CLEAR_SUGGESTED_ACTIONS && onSuggestedActions([], undefined);

        return result;
      } catch (error) {
        onActionThrew(action, depth, error);

        throw error;
      } finally {
        depth--;
      }
    }
  });

  observeRaw = () => {
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
    } = engine.getState() as any;

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

  last = observeRaw();
  lastStatus = last.connectivityStatus;

  // As the Redux store: the machines start when it is created.
  engine.start();

  const { dispatch } = engine;
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
    dispose: () => undefined,
    observe: (): Observation => {
      const raw = observeRaw();

      return { ...raw, voiceHandlers: describeVoiceHandlers(raw.voiceHandlers) };
    },
    ops,
    observeStore: () => ({ sendTimeout: engine.getState().sendTimeout }),
    rawDispatch: action => dispatch(action)
  });
};

export default createDefaultDriver;
