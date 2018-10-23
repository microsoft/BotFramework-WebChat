import { connect } from 'react-redux';
import React from 'react';

import Context from './Context';

function combineSelectors(...selectors) {
  return (...args) => selectors.reduce((result, selector) => ({
    ...result,
    ...removeUndefinedValues((selector && selector(...args)) || {})
  }), {});
}

function removeUndefinedValues(map) {
  return Object.keys(map).reduce((result, key) => {
    const value = map[key];

    if (typeof value !== 'undefined') {
      result[key] = value;
    }

    return result;
  }, {});
}

export default function (...selectors) {
  const combinedSelector = combineSelectors(...selectors);

  return Component => {
    const ConnectedComponent = connect(
      (state, { context, store, ...ownProps }) => combinedSelector({ ...state, ...context }, ownProps)
    )(Component);

    return props => (
      <Context.Consumer>
        {
          context => <ConnectedComponent { ...props } context={ context } store={ context.store } />
        }
      </Context.Consumer>
    );
  };
}
