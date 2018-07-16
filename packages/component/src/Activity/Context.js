import React from 'react';

const Context = React.createContext();

const withActivity = Component => props =>
  <Context.Consumer>
    { ({ activity, attachments }) =>
      <Component
        activity={ activity }
        attachments={ attachments }
        { ...props }
      >
        { props.children }
      </Component>
    }
  </Context.Consumer>

export default Context

export {
  withActivity
}
