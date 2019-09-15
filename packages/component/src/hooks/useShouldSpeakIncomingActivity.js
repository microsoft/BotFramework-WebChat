import { useSelector } from '../WebChatReduxContext';

export default function useShouldSpeakIncomingActivity() {
  return [
    useSelector(({ shouldSpeakIncomingActivity }) => shouldSpeakIncomingActivity),
    () => {
      throw new Error('ShouldSpeakIncomingActivity cannot be set.');
    }
  ];
}
