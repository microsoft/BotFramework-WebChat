import { connect } from 'react-redux';
import React from 'react';

import Context from './Context';

function removeUndefinedValues(map) {
  return Object.keys(map).reduce((result, key) => {
    const value = map[key];

    if (typeof value !== 'undefined') {
      result[key] = value;
    }

    return result;
  }, {});
}

function combineSelectors(...selectors) {
  return (...args) =>
    selectors.reduce(
      (result, selector) => ({
        ...result,
        ...removeUndefinedValues((selector && selector(...args)) || {})
      }),
      {}
    );
}

export default function connectToWebChat(...selectors) {
  const combinedSelector = combineSelectors(...selectors);

  return Component => {
    const ConnectedComponent = connect((state, { context, _, ...ownProps }) =>
      combinedSelector({ ...state, ...context }, ownProps)
    )(Component);

    const WebChatConnectedComponent = props => (
      <Context.Consumer>
        {context => <ConnectedComponent {...props} context={context} store={context.store} />}
      </Context.Consumer>
    );

    return WebChatConnectedComponent;
  };
}
