import { useSelector } from '../WebChatReduxContext';

export default function useConnectivityStatus() {
  return [useSelector(({ connectivityStatus }) => connectivityStatus)];
}
