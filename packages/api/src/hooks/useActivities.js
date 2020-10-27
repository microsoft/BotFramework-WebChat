import { useSelector } from './internal/WebChatReduxContext';

export default function useActivities() {
  return [useSelector(({ activities }) => activities)];
}
