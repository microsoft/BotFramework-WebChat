/* eslint react/no-unsafe: off */

import { useEffect } from 'react';
import PropTypes from 'prop-types';

const Timer = ({ at, onInterval }) => {
  useEffect(() => {
    if (!isNaN(at)) {
      const timeout = setTimeout(() => {
        onInterval && onInterval();
      }, Math.max(0, at - Date.now()));

      return () => clearTimeout(timeout);
    }
  }, [at, onInterval]);

  return false;
};

Timer.defaultProps = {
  onInterval: undefined
};

Timer.propTypes = {
  at: PropTypes.number.isRequired,
  onInterval: PropTypes.func
};

export default Timer;
