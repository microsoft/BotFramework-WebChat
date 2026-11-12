import { useConnectivityStatusSlice } from './internal/domains/ConnectionSlices';

export default function useConnectivityStatus(): [string] {
  return [useConnectivityStatusSlice()];
}
