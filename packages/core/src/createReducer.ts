import { combineReducers } from 'redux';

import createActivitiesReducer from './reducers/createActivitiesReducer';
import createInternalReducer from './reducers/createInternalReducer';
import createNotificationsReducer from './reducers/createNotificationsReducer';
import createTypingReducer from './reducers/createTypingReducer';
import connectivityStatus from './reducers/connectivityStatus';
import dictateInterims from './reducers/dictateInterims';
import dictateState from './reducers/dictateState';
import language from './reducers/language';
import readyState from './reducers/readyState';
import referenceGrammarID from './reducers/referenceGrammarID';
import sendBoxValue from './reducers/sendBoxValue';
import sendTimeout from './reducers/sendTimeout';
import sendTypingIndicator from './reducers/sendTypingIndicator';
import shouldSpeakIncomingActivity from './reducers/shouldSpeakIncomingActivity';
import suggestedActions from './reducers/suggestedActions';

import type { GlobalScopePonyfill } from './types/GlobalScopePonyfill';

export default function createReducer(ponyfill: GlobalScopePonyfill) {
  return combineReducers({
    activities: createActivitiesReducer(ponyfill),
    connectivityStatus,
    dictateInterims,
    dictateState,
    internal: createInternalReducer(ponyfill),
    language,
    notifications: createNotificationsReducer(ponyfill),
    readyState,
    referenceGrammarID,
    sendBoxValue,
    sendTimeout,
    sendTypingIndicator,
    shouldSpeakIncomingActivity,
    suggestedActions,
    typing: createTypingReducer(ponyfill)
  });
}
