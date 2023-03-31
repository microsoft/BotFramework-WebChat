import { createContext } from 'react';

import type { GlobalScopePonyfill } from 'botframework-webchat-core';

type PonyfillContextType = {
  ponyfillState: readonly [GlobalScopePonyfill];
};

export default createContext<PonyfillContextType | undefined>(undefined);
