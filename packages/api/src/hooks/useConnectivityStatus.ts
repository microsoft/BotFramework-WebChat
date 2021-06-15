import { useSelector } from './internal/WebChatReduxContext';

export default function useConnectivityStatus(): [string] {
  return [useSelector(({ connectivityStatus }) => connectivityStatus)];
}
