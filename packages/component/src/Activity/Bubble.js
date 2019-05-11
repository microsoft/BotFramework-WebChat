import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

const Bubble = ({
  'aria-label': ariaLabel,
  children,
  className,
  fromUser,
  styleSet
}) =>
  <div
    aria-label={ ariaLabel }
    className={ classNames(
      styleSet.bubble + '',
      { 'from-user': fromUser },
      className + ''
    ) }
  >
    { children }
  </div>;

Bubble.defaultProps = {
  'aria-label': '',
  children: undefined,
  className: '',
  fromUser: false
};

Bubble.propTypes = {
  'aria-label': PropTypes.string,
  children: PropTypes.any,
  className: PropTypes.string,
  fromUser: PropTypes.bool,
  styleSet: PropTypes.shape({
    bubble: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(Bubble)
