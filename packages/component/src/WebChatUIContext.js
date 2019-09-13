import React from 'react';

const context = React.createContext({
  sendFocusRef: null
});

context.displayName = 'WebChatUIContext';

export default context;
