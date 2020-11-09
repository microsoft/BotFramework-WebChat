import { createContext } from 'react';

const context = createContext({
  sendFocusRef: null
});

context.displayName = 'WebChatAPIContext';

export default context;
