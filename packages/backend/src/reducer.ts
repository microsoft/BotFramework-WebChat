import { combineReducers } from 'redux';

import activities from './reducers/activities';
import connection from './reducers/connection';

export default combineReducers({
  activities,
  connection
})
