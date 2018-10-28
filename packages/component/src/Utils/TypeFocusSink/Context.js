import React from 'react';

const context = React.createContext({
  focusableRef: null
});

context.displayName = 'TypeFocusSinkContext';

export default context
