import { createContext } from 'react';

const context = createContext({
  focusableRef: undefined
});

context.displayName = 'TypeFocusSinkContext';

export default context;
