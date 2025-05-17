import { type Dispatch, type SetStateAction } from 'react';
import useActivityFeedbackContext from './private/useActivityFeedbackContext';

export default function useFeedbackText(): readonly [string, Dispatch<SetStateAction<string>>] {
  return useActivityFeedbackContext().feedbackTextState;
}
