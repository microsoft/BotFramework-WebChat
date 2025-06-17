import { type SuggestedActionsState } from '../internal/types/suggestedActions';
import createRawReducer from './private/createRawReducer';

const suggestedActions = createRawReducer<SuggestedActionsState>('suggestedActions', Object.freeze([]));

export default suggestedActions;
