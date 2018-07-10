import React from 'react';

const Context = React.createContext();

const withLocale = Component => props =>
  <Context.Consumer>
    { ({ locale }) =>
      <Component locale={ locale } { ...props }>
        { props.children }
      </Component>
    }
  </Context.Consumer>;

const withStyleSet = Component => props =>
  <Context.Consumer>
    { ({ styleSet }) =>
      <Component styleSet={ styleSet } { ...props }>
        { props.children }
      </Component>
    }
  </Context.Consumer>;

export default Context

export {
  withLocale,
  withStyleSet
}
