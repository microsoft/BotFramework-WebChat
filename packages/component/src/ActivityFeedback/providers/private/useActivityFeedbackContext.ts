import { useContext } from 'react';
import ActivityFeedbackContext, { type ActivityFeedbackContextType } from './ActivityFeedbackContext';

export default function useActivityFeedbackContext(): ActivityFeedbackContextType {
  return useContext(ActivityFeedbackContext);
}
