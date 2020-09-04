/* eslint react/forbid-dom-props: ["off"] */

import PropTypes from 'prop-types';
import React from 'react';

import useStyleToEmotionObject from './hooks/internal/useStyleToEmotionObject';

const ROOT_STYLE = {
  // .sr-only - This component is intended to be invisible to the visual Web Chat user, but read by the AT when using a screen reader
  color: 'transparent',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  // We need to set top: 0, otherwise, it will repro:
  // - Run NVDA
  // - Make the transcript long enough to show the scrollbar
  // - Press SHIFT-TAB, focus on upload button
  // - Press up arrow multiple times
  top: 0,
  whiteSpace: 'nowrap',
  width: 1
};

const ScreenReaderText = ({ id, text }) => {
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <div className={rootClassName} id={id}>
      {text}
    </div>
  );
};

ScreenReaderText.defaultProps = {
  id: undefined
};

ScreenReaderText.propTypes = {
  id: PropTypes.string,
  text: PropTypes.string.isRequired
};

export default ScreenReaderText;
