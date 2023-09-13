import { createContext } from 'react';
import { createChainOfResponsibility } from 'react-chain-of-responsibility';
import { InputModalityRequest } from '../types/InputModalityRequest';

type ContextType = {
  proxyComponentState: readonly [ReturnType<typeof createChainOfResponsibility<InputModalityRequest>>['Proxy']];
  typeState: readonly [string | undefined, (type: string | undefined) => void];
};

export default createContext<ContextType>(undefined);
