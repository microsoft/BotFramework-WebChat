import { createContext } from 'react';

const context = createContext<any>({
  sendFocusRef: null
});

context.displayName = 'WebChatAPIContext';

export default context;
