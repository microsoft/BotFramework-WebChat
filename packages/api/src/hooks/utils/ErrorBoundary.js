import React, { Component } from 'react';
import PropTypes from 'prop-types';

const RenderChildrenFunction = ({ children }) => (typeof children === 'function' ? children() : children);

class ErrorBoundary extends Component {
  constructor() {
    super();

    this.state = { hasError: false };
  }

  componentDidCatch(error) {
    this.setState({ hasError: true });

    this.props.onError(error);
  }

  render() {
    return !this.state.hasError && <RenderChildrenFunction>{this.props.children}</RenderChildrenFunction>;
  }
}

ErrorBoundary.defaultProps = {
  children: undefined,
  onError: undefined
};

ErrorBoundary.propTypes = {
  children: PropTypes.any,
  onError: PropTypes.func
};

export default ErrorBoundary;
