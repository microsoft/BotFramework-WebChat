import { combineReducers } from 'redux';

import activities from './reducers/activities';
import connection from './reducers/connection';
import input from './reducers/input';
import suggestedActions from './reducers/suggestedActions';

export default combineReducers({
  activities,
  connection,
  input,
  suggestedActions
})
