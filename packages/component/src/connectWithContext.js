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
  return component => props =>
    <Context.Consumer>
      { context =>
        React.createElement(
          connect(
            state => combineSelectors(...selectors)({ ...state, ...context })
          )(component),
          {
            ...props,
            store: context.store
          }
        )
      }
    </Context.Consumer>;
}
