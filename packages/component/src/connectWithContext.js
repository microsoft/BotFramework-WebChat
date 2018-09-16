import { connect } from 'react-redux';
import memoize from 'memoize-one';
import React from 'react';

import Context from './Context';

// TODO: Consider using "store" props, instead of "storeKey"
export default function (stateSelector, contextSelector) {
  const createConnected = memoize(storeKey => connect(state => stateSelector(state), null, null, { storeKey }));

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
