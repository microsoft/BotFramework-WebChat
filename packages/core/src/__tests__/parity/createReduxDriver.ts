// The sagas, as Web Chat runs them: core's Redux store (`createStoreWithOptions()`), with all its sagas, on the clock of
// the script.
import clearSuggestedActions, { CLEAR_SUGGESTED_ACTIONS } from '../../actions/clearSuggestedActions';
import connect from '../../actions/connect';
import disconnect from '../../actions/disconnect';
import emitTypingIndicator from '../../actions/emitTypingIndicator';
import { INCOMING_ACTIVITY } from '../../actions/incomingActivity';
import markActivity from '../../actions/markActivity';
import postActivity, { POST_ACTIVITY_FULFILLED, POST_ACTIVITY_PENDING } from '../../actions/postActivity';
import sendEvent from '../../actions/sendEvent';
import sendFiles from '../../actions/sendFiles';
import sendMessage from '../../actions/sendMessage';
import sendMessageBack from '../../actions/sendMessageBack';
import sendPostBack from '../../actions/sendPostBack';
import setLanguage from '../../actions/setLanguage';
import setSendBox from '../../actions/setSendBox';
import setSendBoxAttachments from '../../actions/setSendBoxAttachments';
import setSendTimeout from '../../actions/setSendTimeout';
import setSendTypingIndicator from '../../actions/setSendTypingIndicator';
import { SET_SUGGESTED_ACTIONS } from '../../actions/setSuggestedActions';
import submitSendBox from '../../actions/submitSendBox';
import { withOptions } from '../../createStore';
import type { CreateDriver, Observation, Operations } from './runParityScript';

const KEYS = Object.freeze([
  'activities',
  'connectivityStatus',
  'notifications',
  'referenceGrammarID',
  'sendBoxAttachments',
  'sendBoxValue',
  'sendTypingIndicator'
] as const);

const createReduxDriver: CreateDriver = ({ faults, onChange, onSuggestedActions, ponyfill }) => {
  const store = withOptions({ ponyfill }, undefined, () => next => (action: any) => {
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
  });

  const observe = (): Observation => {
    const {
      activities,
      connectivityStatus,
      notifications,
      referenceGrammarID,
      sendBoxAttachments,
      sendBoxValue,
      sendTypingIndicator
    } = store.getState();

    return {
      activities,
      connectivityStatus,
      notifications,
      referenceGrammarID,
      sendBoxAttachments,
      sendBoxValue,
      sendTypingIndicator
    };
  };

  let last = observe();

  // Records first: a listener that throws stops the listeners after it.
  const unsubscribeRecorder = store.subscribe(() => {
    const next = observe();

    for (const key of KEYS) {
      // eslint-disable-next-line security/detect-object-injection
      Object.is(next[key], last[key]) || onChange(key, next[key]);
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

  const { dispatch } = store;

  const ops: Operations = Object.freeze({
    clearSuggestedActions: () => dispatch(clearSuggestedActions()),
    emitTypingIndicator: () => dispatch(emitTypingIndicator()),
    markActivity: (activity, name, value) => dispatch(markActivity(activity, name, value)),
    postActivity: (activity, method) => dispatch(postActivity(activity, method)),
    sendEvent: (name, value) => dispatch(sendEvent(name, value)),
    sendFiles: files => dispatch(sendFiles(files)),
    sendMessage: (text, method, init) => dispatch(sendMessage(text, method, init)),
    sendMessageBack: (value, text, displayText, init) => dispatch(sendMessageBack(value, text, displayText, init)),
    sendPostBack: (value, init) => dispatch(sendPostBack(value, init)),
    setLanguage: language => dispatch(setLanguage(language)),
    setSendBox: text => dispatch(setSendBox(text)),
    setSendBoxAttachments: attachments => dispatch(setSendBoxAttachments(attachments)),
    setSendTimeout: sendTimeout => dispatch(setSendTimeout(sendTimeout)),
    setSendTypingIndicator: value => dispatch(setSendTypingIndicator(value)),
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
      unsubscribeFault();
      unsubscribeRecorder();
    },
    observe,
    ops,
    rawDispatch: action => dispatch(action)
  });
};

export default createReduxDriver;
