// The sagas, as Web Chat runs them: core's Redux store (`createStoreWithOptions()`), with all its sagas, on the clock of
// the script.
import connect from '../../actions/connect';
import disconnect from '../../actions/disconnect';
import { INCOMING_ACTIVITY } from '../../actions/incomingActivity';
import { SET_SUGGESTED_ACTIONS } from '../../actions/setSuggestedActions';
import { withOptions } from '../../createStore';
import type { CreateDriver, Observation } from './runParityScript';

const KEYS = Object.freeze(['activities', 'connectivityStatus', 'notifications', 'referenceGrammarID'] as const);

const createReduxDriver: CreateDriver = ({ faults, onChange, onSuggestedActions, ponyfill }) => {
  const store = withOptions({ ponyfill }, undefined, () => next => (action: any) => {
    if (action.type === INCOMING_ACTIVITY && faults.receiveThrowsFor === action.payload.activity.id) {
      throw new Error(`receive ${faults.receiveThrowsFor}`);
    }

    const result = next(action);

    action.type === SET_SUGGESTED_ACTIONS &&
      onSuggestedActions(action.payload.suggestedActions, action.payload.originActivity);

    return result;
  });

  const observe = (): Observation => {
    const { activities, connectivityStatus, notifications, referenceGrammarID } = store.getState();

    return { activities, connectivityStatus, notifications, referenceGrammarID };
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

  return Object.freeze({
    connect: ({ directLine, userID, username }) => {
      store.dispatch(connect({ directLine, userID: userID as string, username }));
    },
    disconnect: () => {
      store.dispatch(disconnect());
    },
    dispose: () => {
      unsubscribeFault();
      unsubscribeRecorder();
    },
    observe
  });
};

export default createReduxDriver;
