import useActivityFeedbackContext from './private/useActivityFeedbackContext';

export default function useHasSubmitted(): readonly [boolean] {
  return useActivityFeedbackContext().hasSubmittedState;
}
