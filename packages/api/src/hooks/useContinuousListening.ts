import { useSelector } from './internal/WebChatReduxContext';

export default function useContinuousListening(): boolean {
  return useSelector(({ continuousListening }) => continuousListening);
}
