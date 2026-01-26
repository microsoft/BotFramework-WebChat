import { useContext } from 'react';
import CapabilitiesContext, { type CapabilitiesContextType } from './Context';

export default function useCapabilitiesContext(): CapabilitiesContextType {
  const context = useContext(CapabilitiesContext);

  if (!context) {
    throw new Error('botframework-webchat internal: This hook can only be used under <CapabilitiesComposer>.');
  }

  return context;
}
