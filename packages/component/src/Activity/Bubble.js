import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

const ROOT_CSS = css({
  position: 'relative',

  '& > .webchat__bubble__content': {
    // This is for hiding content outside of the bubble, for example, content outside of border radius
    overflow: 'hidden'
  },

  '& > .webchat__bubble__nub': {
    position: 'absolute'
  }
});

const Bubble = ({ 'aria-hidden': ariaHidden, children, className, fromUser, nub, styleSet }) => (
  <div
    aria-hidden={ariaHidden}
    className={classNames(
      ROOT_CSS + '',
      styleSet.bubble + '',
      { 'from-user': fromUser, webchat__bubble_has_nub: nub },
      className + '' || ''
    )}
  >
    <div className="webchat__bubble__content">{children}</div>
    {nub && !!(fromUser ? styleSet.options.bubbleFromUserNubSize : styleSet.options.bubbleNubSize) && (
      <div className="webchat__bubble__nub" />
    )}
  </div>
);

Bubble.defaultProps = {
  'aria-hidden': false,
  children: undefined,
  className: '',
  fromUser: false,
  nub: true
};

Bubble.propTypes = {
  'aria-hidden': PropTypes.bool,
  children: PropTypes.any,
  className: PropTypes.string,
  fromUser: PropTypes.bool,
  nub: PropTypes.bool,
  styleSet: PropTypes.shape({
    bubble: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(Bubble);
