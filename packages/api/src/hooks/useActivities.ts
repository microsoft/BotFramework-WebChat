import { useSelector } from './internal/WebChatReduxContext';
import DirectLineActivity from '../types/external/DirectLineActivity';

export default function useActivities(): [DirectLineActivity[]] {
  return [useSelector(({ activities }) => activities)];
}
