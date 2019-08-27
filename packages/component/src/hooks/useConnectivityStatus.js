import useSelector from './useSelector';

export default function useConnectivityStatus() {
  return useSelector(({ connectivityStatus }) => connectivityStatus);
}
