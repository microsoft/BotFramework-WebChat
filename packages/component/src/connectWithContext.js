import { connect } from 'react-redux';
import memoize from 'memoize-one';
import React from 'react';

import Context from './Context';

export default function (stateSelector, contextSelector) {
  const createConnected = memoize(storeKey => connect(state => stateSelector(state), { storeKey }));

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
