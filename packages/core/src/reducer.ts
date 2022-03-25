import { combineReducers } from 'redux';

import activities from './reducers/activities';
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
import typing from './reducers/typing';

export default combineReducers({
  activities,
  connectivityStatus,
  dictateInterims,
  dictateState,
  language,
  notifications,
  readyState,
  referenceGrammarID,
  sendBoxValue,
  sendTimeout,
  sendTypingIndicator,
  shouldSpeakIncomingActivity,
  suggestedActions,
  typing,

  // TODO: [P3] Take this deprecation code out when releasing on or after 2022-02-16
  lastTypingAt
});
