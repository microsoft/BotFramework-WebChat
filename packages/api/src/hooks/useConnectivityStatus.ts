import { useSelector } from './internal/WebChatReduxContext';

const selectConnectivityStatus = ({ connectivityStatus }) => connectivityStatus;

export default function useConnectivityStatus(): [string] {
  return [useSelector(selectConnectivityStatus)];
}
