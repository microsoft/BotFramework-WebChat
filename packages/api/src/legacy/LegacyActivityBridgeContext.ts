import { createContext, useContext } from 'react';

type LegacyActivityContextType = {
  readonly hideTimestamp: boolean;
  readonly showCallout: boolean;
};

const LegacyActivityContext = createContext<LegacyActivityContextType>(
  Object.freeze({
    hideTimestamp: false,
    showCallout: false
  })
);

function useLegacyActivityContext(): LegacyActivityContextType {
  return useContext(LegacyActivityContext);
}

// Exporting <Provider> individually so we can let people write to the context but not reading from it.
const { Provider: LegacyActivityContextProvider } = LegacyActivityContext;

export default LegacyActivityContext;
export { LegacyActivityContextProvider, useLegacyActivityContext, type LegacyActivityContextType };
