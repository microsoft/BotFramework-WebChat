import { type Source } from './Source';
import createDomainContext from './private/createDomainContext';

type ConnectivityContextType = {
  readonly connectivityStatus: Source<string>;
  readonly referenceGrammarID: Source<string>;
};

const [ConnectivityContext, useConnectivityContext] =
  createDomainContext<ConnectivityContextType>('WebChatConnectivityContext');

export default ConnectivityContext;
export { useConnectivityContext, type ConnectivityContextType };
