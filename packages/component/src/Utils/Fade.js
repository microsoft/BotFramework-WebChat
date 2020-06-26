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

  // TODO: Find a better value or way (setTimeout, requestAnimationFrame, etc)
  fadeAfter: 100
  // fadeAfter: 0 // Setting to 0 will make some screen reader text not read at all.
};

Fade.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  fadeAfter: PropTypes.number
};

export default Fade;
