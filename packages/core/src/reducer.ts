import { combineReducers } from 'redux';

import activities from './reducers/activities';
import clockSkewAdjustment from './reducers/clockSkewAdjustment';
import connectivityStatus from './reducers/connectivityStatus';
import dictateInterims from './reducers/dictateInterims';
import dictateState from './reducers/dictateState';
import language from './reducers/language';
import lastTypingAt from './reducers/lastTypingAt';
import notifications from './reducers/notifications';
import readyState from './reducers/readyState';
import referenceGrammarID from './reducers/referenceGrammarID';
import sendBoxValue from './reducers/sendBoxValue';
import sendTimeout from './reducers/sendTimeout';
import sendTypingIndicator from './reducers/sendTypingIndicator';
import shouldSpeakIncomingActivity from './reducers/shouldSpeakIncomingActivity';
import suggestedActions from './reducers/suggestedActions';

export default combineReducers({
  activities,
  clockSkewAdjustment,
  connectivityStatus,
  dictateInterims,
  dictateState,
  language,
  lastTypingAt,
  notifications,
  readyState,
  referenceGrammarID,
  sendBoxValue,
  sendTimeout,
  sendTypingIndicator,
  shouldSpeakIncomingActivity,
  suggestedActions
});
