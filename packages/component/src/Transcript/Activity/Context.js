import React from 'react';

const Context = React.createContext();

const withActivity = Component => props =>
  <Context.Consumer>
    { ({ activity }) =>
      <Component activity={ activity } { ...props }>
        { props.children }
      </Component>
    }
  </Context.Consumer>

export default Context

export {
  withActivity
}
