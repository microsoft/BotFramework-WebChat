import PropTypes from 'prop-types';
import React from 'react';

import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

// TODO: [P3] Although this is for development purpose, prettify it
const ROOT_STYLE = {
  color: 'Red',
  margin: 0
};

const SayAlt = ({ speak }) => {
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return !!speak && <pre className={rootClassName}>{speak}</pre>;
};

SayAlt.defaultProps = {
  speak: ''
};

SayAlt.propTypes = {
  speak: PropTypes.string
};

export default SayAlt;
