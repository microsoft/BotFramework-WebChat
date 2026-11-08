import { useConnectivityContext } from './internal/domains/ConnectivityContext';
import useSourceValue from './internal/domains/useSourceValue';

export default function useReferenceGrammarID(): [string] {
  return [useSourceValue(useConnectivityContext().referenceGrammarID)];
}
