import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import * as browser from '../lib/Utils/detectBrowser';

const ROOT_CSS = css({
  // .sr-only - This component is intended to be invisible to the visual Web Chat user, but read by the AT when using a screen reader
  color: 'transparent',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1
});

const ScreenReaderText = ({ text }) => {
  const ariaLabel = browser.chrome ? ' ' : text;
  return (
    // Because of differences in browser implementations, <span aria-label> is used to make the screen reader perform the same on different browsers. This workaround was made to accommodate Chrome
    <span aria-label={ariaLabel} className={classNames(ROOT_CSS + '')}>
      {text}
    </span>
  );
};

ScreenReaderText.propTypes = {
  text: PropTypes.string.isRequired
};

export default ScreenReaderText;
