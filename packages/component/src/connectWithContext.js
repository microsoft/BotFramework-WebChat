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

export default function (selector) {
  return component => props =>
    <Context.Consumer>
      { context =>
        React.createElement(
          connect(
            state => removeUndefinedValues((selector && selector(state)) || {}),
            null,
            (stateProps, dispatchProps, ownProps) => ({
              ...ownProps,
              ...stateProps,
              ...dispatchProps,
              ...removeUndefinedValues((selector && selector(context)) || {})
            })
          )(component),
          {
            ...props,
            store: context.store
          }
        )
      }
    </Context.Consumer>;
}
