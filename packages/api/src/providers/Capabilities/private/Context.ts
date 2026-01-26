import { createContext } from 'react';
import type { Capabilities } from '../types/Capabilities';

type CapabilitiesContextType = Readonly<{
  capabilities: Capabilities;
}>;

const CapabilitiesContext = createContext<CapabilitiesContextType | undefined>(undefined);

CapabilitiesContext.displayName = 'CapabilitiesContext';

export default CapabilitiesContext;
export type { CapabilitiesContextType };
