import { combineReducers } from 'redux';

import activities from './reducers/activities';
import connection from './reducers/connection';
import input from './reducers/input';
import settings from './reducers/settings';
import suggestedActions from './reducers/suggestedActions';

export default combineReducers({
  activities,
  connection,
  input,
  settings,
  suggestedActions
})
