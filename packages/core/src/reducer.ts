import { combineReducers } from 'redux';

import activities from './reducers/activities';
import dictateInterims from './reducers/dictateInterims';
import dictateState from './reducers/dictateState';
import language from './reducers/language';
import readyState from './reducers/readyState';
import referenceGrammarID from './reducers/referenceGrammarID';
import sendBoxValue from './reducers/sendBoxValue';
import suggestedActions from './reducers/suggestedActions';

export default combineReducers({
  activities,
  dictateInterims,
  dictateState,
  language,
  readyState,
  referenceGrammarID,
  sendBoxValue,
  suggestedActions
})
