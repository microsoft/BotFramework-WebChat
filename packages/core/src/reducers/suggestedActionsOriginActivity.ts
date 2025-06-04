import { type SuggestedActionsOriginActivityState } from '../internal/types/suggestedActionsOriginActivity';
import createRawReducer from './private/createRawReducer';

const suggestedActionsOriginActivity = createRawReducer<SuggestedActionsOriginActivityState>(
  'suggestedActionsOriginActivity',
  Object.freeze({ activity: undefined })
);

export default suggestedActionsOriginActivity;
