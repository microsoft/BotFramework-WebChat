import { useSelector } from '../WebChatReduxContext';

export default function useShouldSpeakIncomingActivity() {
  return useSelector(({ shouldSpeakIncomingActivity }) => shouldSpeakIncomingActivity);
}
