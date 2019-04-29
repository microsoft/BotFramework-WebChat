import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

const ROOT_CSS = css({
  position: 'relative',

  '& > .content': {
    flex: 1,
    overflow: 'hidden'
  },

  '& > .nub': {
    position: 'absolute'
  }
});

const Bubble = ({ 'aria-hidden': ariaHidden, children, className, fromUser, nub, styleSet }) => (
  <div aria-hidden={ariaHidden} className={classNames(ROOT_CSS + '', styleSet.bubble + '', { 'from-user': fromUser, indent: nub === 'hidden', 'has-nub': nub === 'visible' }, (className + '') || '')}>
    <div className="content">
      {children}
    </div>
    {
      nub === 'visible'
      && !!(fromUser ? styleSet.options.bubbleFromUserNubSize : styleSet.options.bubbleNubSize)
      && <div className="nub" /> }
  </div>
);

Bubble.defaultProps = {
  'aria-hidden': true,
  children: undefined,
  className: '',
  fromUser: false,
  hideNub: false
};

Bubble.propTypes = {
  'aria-hidden': PropTypes.bool,
  children: PropTypes.any,
  className: PropTypes.string,
  fromUser: PropTypes.bool,
  hideNub: PropTypes.bool,
  styleSet: PropTypes.shape({
    bubble: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(Bubble);
