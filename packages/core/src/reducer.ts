import { combineReducers } from 'redux';

import activities from './reducers/activities';
import clockSkewAdjustment from './reducers/clockSkewAdjustment';
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
import lastAction from './reducers/lastAction';

export default combineReducers({
  activities,
  clockSkewAdjustment,
  connectivityStatus,
  dictateInterims,
  dictateState,
  language,
  readyState,
  referenceGrammarID,
  sendBoxValue,
  sendTimeout,
  sendTypingIndicator,
  shouldSpeakIncomingActivity,
  suggestedActions,
  lastAction,

  // TODO: [P3] Take this deprecation code out when releasing on or after January 13 2020
  sendTyping: sendTypingIndicator
});
