import { combineReducers } from 'redux';

import { assertPrepared } from './prepare/prepareAction';
import combineActivitiesReducer from './reducers/activities/combineActivitiesReducer';
import connectivityStatus from './reducers/connectivityStatus';
import dictateInterims from './reducers/dictateInterims';
import dictateState from './reducers/dictateState';
import language from './reducers/language';
import notifications from './reducers/notifications';
import readyState from './reducers/readyState';
import referenceGrammarID from './reducers/referenceGrammarID';
import sendBoxAttachments from './reducers/sendBoxAttachments';
import sendBoxValue from './reducers/sendBoxValue';
import sendTimeout from './reducers/sendTimeout';
import sendTypingIndicator from './reducers/sendTypingIndicator';
import shouldSpeakIncomingActivity from './reducers/shouldSpeakIncomingActivity';
import suggestedActions from './reducers/suggestedActions';
import suggestedActionsOriginActivity from './reducers/suggestedActionsOriginActivity';
import typing from './reducers/typing';
import voiceActivity from './reducers/voiceActivity';

/**
 * The reducer of every store: a pure function of the state and the action. What it needs from the clock or a random ID
 * comes in the action (`prepareAction()`); an action that was not prepared throws.
 */
const combinedReducer = combineActivitiesReducer(
  combineReducers({
    connectivityStatus,
    dictateInterims,
    dictateState,
    // The ponyfill of the store, from the initial state (`createStore()`).
    internal: (state = {}) => state,
    language,
    notifications,
    readyState,
    referenceGrammarID,
    sendBoxAttachments,
    sendBoxValue,
    sendTimeout,
    sendTypingIndicator,
    shouldSpeakIncomingActivity,
    suggestedActions,
    suggestedActionsOriginActivity,
    typing,
    voice: voiceActivity
  })
);

const reducer: typeof combinedReducer = (state, action) => combinedReducer(state, assertPrepared(action));

export default reducer;
