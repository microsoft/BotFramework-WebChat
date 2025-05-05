import useActivityFeedbackContext from './private/useActivityFeedbackContext';

export default function useShouldShowFeedbackForm(): readonly [boolean] {
  return useActivityFeedbackContext().shouldShowFeedbackFormState;
}
