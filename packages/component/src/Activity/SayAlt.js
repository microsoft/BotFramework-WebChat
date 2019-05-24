import { css } from 'glamor';
import PropTypes from 'prop-types';
import React from 'react';

// TODO: [P3] Although this is for development purpose, prettify it
const ROOT_CSS = css({
  color: 'Red',
  margin: 0
});

const SayAlt = ({ speak }) => !!speak && <pre className={ROOT_CSS}>{speak}</pre>;

SayAlt.defaultProps = {
  speak: ''
};

SayAlt.propTypes = {
  speak: PropTypes.string
};

export default SayAlt;
