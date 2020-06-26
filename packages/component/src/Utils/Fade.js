import { useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';

const Fade = ({ children, fadeAfter }) => {
  const [faded, setFaded] = useState(false);

  useLayoutEffect(() => {
    setFaded(false);

    const timeout = setTimeout(() => {
      setFaded(true);
    }, fadeAfter);

    return () => clearTimeout(timeout);
  }, [fadeAfter]);

  return !faded && (typeof children === 'function' ? children() : children);
};

Fade.defaultProps = {
  children: undefined,
  fadeAfter: 1000
};

Fade.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  fadeAfter: PropTypes.number
};

export default Fade;
