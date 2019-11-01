import { useSelector } from '../WebChatReduxContext';

export default function useActivities() {
  return [useSelector(({ activities }) => activities)];
}
