import React from 'react';

const Context = React.createContext();

const withCard = Component => props =>
  <Context.Consumer>
    { ({ card }) =>
      <Component card={ card } { ...props }>
        { props.children }
      </Component>
    }
  </Context.Consumer>

export default Context

export {
  withCard
}
