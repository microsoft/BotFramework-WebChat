import PropTypes from 'prop-types';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor() {
    super();

    this.state = { error: undefined };
  }

  componentDidCatch(error) {
    this.setState({ error });

    this.props.onError(error);
  }

  render() {
    return !this.state.error && this.props.children;
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
