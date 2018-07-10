import React from 'react';

const Context = React.createContext();

const withSendBoxContext = Component => props =>
  <Context.Consumer>
    { context =>
      <Component sendBoxContext={ context } { ...props }>
        { props.children }
      </Component>
    }
  </Context.Consumer>

export default Context;

export {
  withSendBoxContext
}
