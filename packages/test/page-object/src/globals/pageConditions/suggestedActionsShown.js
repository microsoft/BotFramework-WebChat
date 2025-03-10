import became from './became';
import getSuggestedActions from '../pageElements/suggestedActions';

export default function suggestedActionsShown() {
  return became('suggested actions is shown', () => getSuggestedActions().length, 1000);
}
