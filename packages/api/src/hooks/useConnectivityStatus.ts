import { useSelector } from '@msinternal/botframework-webchat-redux-store';

const selectConnectivityStatus = ({ connectivityStatus }) => connectivityStatus;

export default function useConnectivityStatus(): [string] {
  return [useSelector(selectConnectivityStatus)];
}
