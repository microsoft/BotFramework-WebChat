import React from 'react';

const context = React.createContext({
  sendFocusRef: null
});

context.displayName = 'WebChatAPIContext';

export default context;
