import React from 'react';

const context = React.createContext({
  sendFocusRef: null
});

context.displayName = 'TypeFocusSinkContext';

export default context;
