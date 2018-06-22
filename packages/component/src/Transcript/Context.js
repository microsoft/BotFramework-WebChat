import React from 'react';

const Context = React.createContext({
  activities: []
});

const withActivities = Component => props =>
  <Context.Consumer>
    { ({ activities }) =>
      <Component activities={ activities } { ...props }>
        { props.children }
      </Component>
    }
  </Context.Consumer>

export default Context;

export {
  withActivities
}
