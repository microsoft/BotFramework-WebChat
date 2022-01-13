import { createContext } from 'react';

type ActiveDescendantIdSetter = (
  nextActiveDescendantId?: string | ((activeDescendantId: string) => string | undefined)
) => void;

// type DefaultActiveDescendant = 'first' | 'last' | 'none';

type ActiveDescendantContextType = {
  activeDescendantId: string | undefined;
  // defaultActiveDescendant: DefaultActiveDescendant;
  focusContainer: () => void;
  setActiveDescendantId: ActiveDescendantIdSetter;
};

export default createContext<ActiveDescendantContextType>(undefined);

export type {
  ActiveDescendantIdSetter
  // DefaultActiveDescendant
};
