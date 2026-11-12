import connectivityStatus from '../reducers/connectivityStatus';
import createNotificationsReducer from '../reducers/createNotificationsReducer';
import dictateInterims from '../reducers/dictateInterims';
import dictateState from '../reducers/dictateState';
import language from '../reducers/language';
import referenceGrammarID from '../reducers/referenceGrammarID';
import sendBoxAttachments from '../reducers/sendBoxAttachments';
import sendBoxValue from '../reducers/sendBoxValue';
import sendTimeout from '../reducers/sendTimeout';
import sendTypingIndicator from '../reducers/sendTypingIndicator';
import shouldSpeakIncomingActivity from '../reducers/shouldSpeakIncomingActivity';
import voiceActivity from '../reducers/voiceActivity';
import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import combineSliceReducers from './combineSliceReducers';

// Any action that no reducer handles: each reducer returns its default state.
const INIT_ACTION = Object.freeze({ type: '@@webchat/default-mode/INIT' });

/**
 * The reducers of default mode, in groups: the reducers of the Redux store (the same functions), without the
 * activities (the activities store) and without the slices that nothing reads in default mode (`internal`, `readyState`,
 * `suggestedActions`, `suggestedActionsOriginActivity`, `typing`).
 *
 * One group per domain, so a change re-renders the readers of its domain only. `outgoing` has no reader: only the
 * machines select it.
 */
export default function createDefaultModeReducers(ponyfill: GlobalScopePonyfill) {
  return Object.freeze({
    connection: combineSliceReducers({
      connectivityStatus,
      notifications: createNotificationsReducer(ponyfill),
      referenceGrammarID
    }),
    outgoing: combineSliceReducers({ language, sendTimeout }),
    sendBox: combineSliceReducers({ sendBoxAttachments, sendBoxValue, sendTypingIndicator }),
    speech: combineSliceReducers({ dictateInterims, dictateState, shouldSpeakIncomingActivity }),
    voice: combineSliceReducers({ voice: voiceActivity })
  });
}

type DefaultModeReducers = ReturnType<typeof createDefaultModeReducers>;

/** The state of a reducer before its first action. */
function getInitialState<S>(reducer: (state: S | undefined, action: typeof INIT_ACTION) => S): S {
  return reducer(undefined, INIT_ACTION);
}

export { getInitialState, type DefaultModeReducers };
