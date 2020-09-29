import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import useTrackException from '../useTrackException';
import useErrorBoxClass from './useErrorBoxClass';

const ErrorBox = ({ error, type }) => {
  const [errorBoxClass] = useErrorBoxClass();
  const trackException = useTrackException();

  useEffect(() => {
    trackException(error, false);
  }, [error, trackException]);

  // console.log({ error, errorBoxClass, type });
  // console.trace();

  return React.createElement(errorBoxClass, { error, type });
};

ErrorBox.defaultProps = {
  type: undefined
};

ErrorBox.propTypes = {
  error: PropTypes.any.isRequired,
  type: PropTypes.string
};

export default ErrorBox;
