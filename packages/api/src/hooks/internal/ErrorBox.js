import { createElement, useEffect } from 'react';
import PropTypes from 'prop-types';

import useErrorBoxClass from './useErrorBoxClass';
import useTrackException from '../useTrackException';

const ErrorBox = ({ error, type }) => {
  const [errorBoxClass] = useErrorBoxClass();
  const trackException = useTrackException();

  useEffect(() => {
    trackException(error, false);
  }, [error, trackException]);

  // console.log({ error, errorBoxClass, type });
  // console.trace();

  return createElement(errorBoxClass, { error, type });
};

ErrorBox.defaultProps = {
  type: undefined
};

ErrorBox.propTypes = {
  error: PropTypes.any.isRequired,
  type: PropTypes.string
};

export default ErrorBox;
