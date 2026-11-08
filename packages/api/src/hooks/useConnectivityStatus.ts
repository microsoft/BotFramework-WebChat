import { useConnectivityContext } from './internal/domains/ConnectivityContext';
import useSourceValue from './internal/domains/useSourceValue';

export default function useConnectivityStatus(): [string] {
  return [useSourceValue(useConnectivityContext().connectivityStatus)];
}
