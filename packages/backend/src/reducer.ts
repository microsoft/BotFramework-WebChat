import { combineReducers } from 'redux';

import activities from './reducers/activities';
import connection from './reducers/connection';
import suggestedActions from './reducers/suggestedActions';

export default combineReducers({
  activities,
  connection,
  suggestedActions
})
