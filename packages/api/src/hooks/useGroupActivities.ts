import DirectLineActivity from '../types/DirectLineActivity';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useGroupActivities(): ({
  activities
}: {
  activities: DirectLineActivity[];
}) => {
  sender: DirectLineActivity[][];
  status: DirectLineActivity[][];
} {
  return useWebChatAPIContext().groupActivities;
}
