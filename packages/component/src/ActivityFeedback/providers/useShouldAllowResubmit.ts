import useActivityFeedbackContext from './private/useActivityFeedbackContext';

export default function useShouldAllowResubmit(): readonly [boolean] {
  return useActivityFeedbackContext().shouldAllowResubmitState;
}
