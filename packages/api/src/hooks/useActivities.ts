import { useSelector } from './internal/WebChatReduxContext';
import DirectLineActivity from '../types/DirectLineActivity';

export default function useActivities(): [DirectLineActivity[]] {
  return [useSelector(({ activities }) => activities)];
}
