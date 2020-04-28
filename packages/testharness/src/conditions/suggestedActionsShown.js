import getSuggestedActions from '../elements/suggestedActions';

export default function suggestedActionsShown() {
  return {
    message: `suggested actions is shown`,
    fn: () => getSuggestedActions().length
  };
}
