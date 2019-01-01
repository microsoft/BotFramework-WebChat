import { combineReducers } from 'redux';

import activities from './reducers/activities';
import dictateInterims from './reducers/dictateInterims';
import dictateState from './reducers/dictateState';
import direction from './reducers/direction';
import language from './reducers/language';
import readyState from './reducers/readyState';
import referenceGrammarID from './reducers/referenceGrammarID';
import sendBoxValue from './reducers/sendBoxValue';
import sendTimeout from './reducers/sendTimeout';
import suggestedActions from './reducers/suggestedActions';

export default combineReducers({
  activities,
  dictateInterims,
  dictateState,
  direction,
  language,
  readyState,
  referenceGrammarID,
  sendBoxValue,
  sendTimeout,
  suggestedActions
})
