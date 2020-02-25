import PropTypes from 'prop-types';

import React from 'react';

class ErrorBoundary extends React.Component {
  // Currently, we do not show any error screen.
  // We will propagate the error to React to let it unmount Web Chat.
  static getDerivedStateFromError() {}

  componentDidCatch(error) {
    const { onError } = this.props;
    const errorEvent = new ErrorEvent('error', { error });

    onError && onError(errorEvent);
  }

  render() {
    return this.props.children;
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
