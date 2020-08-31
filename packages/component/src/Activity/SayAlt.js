import PropTypes from 'prop-types';
import React from 'react';

import useStyleToClassName from '../hooks/internal/useStyleToClassName';

// TODO: [P3] Although this is for development purpose, prettify it
const ROOT_STYLE = {
  color: 'Red',
  margin: 0
};

const SayAlt = ({ speak }) => {
  const rootClassName = useStyleToClassName()(ROOT_STYLE);

  return !!speak && <pre className={rootClassName}>{speak}</pre>;
};

SayAlt.defaultProps = {
  speak: ''
};

SayAlt.propTypes = {
  speak: PropTypes.string
};

export default SayAlt;
