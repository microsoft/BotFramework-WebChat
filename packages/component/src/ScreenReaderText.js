import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from './connectToWebChat';

const ROOT_CSS = css({
  // .sr-only - This component is intended to be invisible to the visual Web Chat user, but read by the AT when using a screen reader
  color: 'transparent',
  height: 1,
  left: -10000,
  overflow: 'hidden',
  position: 'absolute',
  top: 0,
  whiteSpace: 'nowrap',
  width: 1
});

const ScreenReaderText = ({ text }) => (
  /* Because of differences in browser implementations, <span aria-label> is used to make the screen reader perform the same on different browsers. This workaround was made to accommodate Edge v44 */
  <span aria-label={text} className={classNames(ROOT_CSS + '')}>
    {text}
  </span>
);

ScreenReaderText.propTypes = {
  text: PropTypes.string.isRequired
};

export default connectToWebChat()(ScreenReaderText);
