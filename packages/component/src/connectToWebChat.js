import { connect } from 'react-redux';
import React from 'react';

import Context from './Context';
import WebChatReduxContext from './WebChatReduxContext';

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

  // TODO: [P1] Instead of exposing Redux store via props, we should consider exposing via Context.
  //       We should also hide dispatch function.
  return Component => {
    const ConnectedComponent = connect(
      (state, { context, ...ownProps }) => combinedSelector({ ...state, ...context }, ownProps),
      null,
      null,
      {
        context: WebChatReduxContext
      }
    )(Component);

    const WebChatConnectedComponent = props => (
      <Context.Consumer>{context => <ConnectedComponent {...props} context={context} />}</Context.Consumer>
    );

    return WebChatConnectedComponent;
  };
}
