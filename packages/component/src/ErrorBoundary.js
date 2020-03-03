import PropTypes from 'prop-types';
import React from 'react';

class ErrorBoundary extends React.Component {
  // Currently, all errors caught are fatal errors.
  // We will bubble up the error and let React unmount us.
  componentDidCatch(error) {
    const { onError } = this.props;
    const errorEvent = new ErrorEvent('error', { error });

    onError && onError(errorEvent);
  }

  render() {
    const { children } = this.props;

    return children;
  }
}

ErrorBoundary.defaultProps = {
  children: false,
  onError: undefined
};

ErrorBoundary.propTypes = {
  children: PropTypes.any,
  onError: PropTypes.func
};

export default ErrorBoundary;
