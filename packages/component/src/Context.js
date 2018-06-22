import React from 'react';

const Context = React.createContext();

const withStyleSet = Component => props =>
  <Context.Consumer>
    { ({ styleSet }) =>
      <Component styleSet={ styleSet } { ...props }>
        { props.children }
      </Component>
    }
  </Context.Consumer>

export default Context

export {
  withStyleSet
}
