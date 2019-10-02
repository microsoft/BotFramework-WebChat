import React from 'react';

const context = React.createContext({
  focusableRef: undefined
});

context.displayName = 'TypeFocusSinkContext';

export default context;
