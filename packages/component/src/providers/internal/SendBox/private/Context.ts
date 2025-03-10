import { createContext } from 'react';

import type { ContextType } from './types';

const SendBoxContext = createContext<ContextType | undefined>(undefined);

export default SendBoxContext;
