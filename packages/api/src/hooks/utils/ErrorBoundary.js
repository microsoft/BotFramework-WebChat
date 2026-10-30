import React, { Component } from 'react';

const RenderChildrenFunction = ({ children }) => (typeof children === 'function' ? children() : children);

class ErrorBoundary extends Component {
  constructor() {
    super();

    this.state = { hasError: false };
  }

  componentDidCatch(error) {
    const { onError } = this.props;

    this.setState({ hasError: true });

    onError(error);
  }

  render() {
    const { children } = this.props;
    const { hasError } = this.state;

    return !hasError && <RenderChildrenFunction>{children}</RenderChildrenFunction>;
  }
}

export default ErrorBoundary;
