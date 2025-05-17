import { useContext } from 'react';
import ActivityFeedbackContext, { type ActivityFeedbackContextType } from './private/ActivityFeedbackContext';

export default function useActivityFeedbackHooks(): ActivityFeedbackContextType {
  return useContext(ActivityFeedbackContext);
}
