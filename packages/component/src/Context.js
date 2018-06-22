import React from 'react';

const context = React.createContext();

const withStyleSet = Component => props =>
  <context.Consumer>
    { ({ styleSet }) =>
      <Component styleSet={ styleSet } { ...props }>
        { props.children }
      </Component>
    }
  </context.Consumer>

export default context

export {
  withStyleSet
}
