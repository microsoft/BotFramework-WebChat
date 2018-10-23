import { connect } from 'react-redux';
import React from 'react';

import Context from './Context';

function combineSelectors(...selectors) {
  return state => selectors.reduce((result, selector) => ({
    ...result,
    ...removeUndefinedValues((selector && selector(state)) || {})
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
      (state, { context }) => combinedSelector({ ...state, ...context })
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
