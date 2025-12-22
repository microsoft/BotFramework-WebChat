import { combineReducers } from 'redux';

import combineActivitiesReducer from './reducers/activities/combineActivitiesReducer';
import connectivityStatus from './reducers/connectivityStatus';
import createInternalReducer from './reducers/createInternalReducer';
import createNotificationsReducer from './reducers/createNotificationsReducer';
import createTypingReducer from './reducers/createTypingReducer';
import dictateInterims from './reducers/dictateInterims';
import dictateState from './reducers/dictateState';
import language from './reducers/language';
import readyState from './reducers/readyState';
import referenceGrammarID from './reducers/referenceGrammarID';
import sendBoxAttachments from './reducers/sendBoxAttachments';
import sendBoxValue from './reducers/sendBoxValue';
import sendTimeout from './reducers/sendTimeout';
import sendTypingIndicator from './reducers/sendTypingIndicator';
import shouldSpeakIncomingActivity from './reducers/shouldSpeakIncomingActivity';
import suggestedActions from './reducers/suggestedActions';
import suggestedActionsOriginActivity from './reducers/suggestedActionsOriginActivity';

import type { GlobalScopePonyfill } from './types/GlobalScopePonyfill';
import type { RestrictedRootDebugAPI } from './types/RootDebugAPI';

export default function createReducer(ponyfill: GlobalScopePonyfill, rootPrivateDebugAPI: RestrictedRootDebugAPI) {
  return combineActivitiesReducer(
    ponyfill,
    rootPrivateDebugAPI,
    combineReducers({
      connectivityStatus,
      dictateInterims,
      dictateState,
      internal: createInternalReducer(ponyfill),
      language,
      notifications: createNotificationsReducer(ponyfill),
      readyState,
      referenceGrammarID,
      sendBoxAttachments,
      sendBoxValue,
      sendTimeout,
      sendTypingIndicator,
      shouldSpeakIncomingActivity,
      suggestedActions,
      suggestedActionsOriginActivity,
      typing: createTypingReducer(ponyfill)
    })
  );
}
