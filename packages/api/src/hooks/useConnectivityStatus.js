import { useSelector } from './internal/WebChatReduxContext';

export default function useConnectivityStatus() {
  return [useSelector(({ connectivityStatus }) => connectivityStatus)];
}
