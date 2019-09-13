import { useSelector } from '../WebChatReduxContext';

export default function useSuggestedActions() {
  return useSelector(({ suggestedActions }) => suggestedActions);
}
