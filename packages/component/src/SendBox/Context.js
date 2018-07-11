import React from 'react';

// TODO: Sync with composer
const Context = React.createContext({
  suggestedActions: []
});

const withSuggestedActions = Component => props =>
  <Context.Consumer>
    { context =>
      <Component suggestedActions={ context.suggestedActions } { ...props }>
        { props.children }
      </Component>
    }
  </Context.Consumer>

export default Context;

export {
  withSuggestedActions
}
