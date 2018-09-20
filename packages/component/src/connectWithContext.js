import { connect } from 'react-redux';
import memoize from 'memoize-one';
import React from 'react';

import Context from './Context';

// TODO: [P4] Consider using "store" props, instead of "storeKey"
// TODO: [P4] Consider hardcoding "storeKey" because it is a rarely used feature in Redux, collision is very unlikely
export default function (stateSelector, contextSelector) {
  const createConnected = memoize(storeKey => connect(state => stateSelector(state), null, null, { storeKey: 'webchat' }));

  return component => props => (
    <Context.Consumer>
      { context => {
        return React.createElement(
          createConnected(context.storeKey)(component),
          ({
            ...contextSelector ? contextSelector(context) : {},
            ...props
          })
        );
      } }
    </Context.Consumer>
  );
}
