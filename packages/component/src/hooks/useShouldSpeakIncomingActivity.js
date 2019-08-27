import useSelector from './useSelector';

export default function useShouldSpeakIncomingActivity() {
  return useSelector(({ shouldSpeakIncomingActivity }) => shouldSpeakIncomingActivity);
}
