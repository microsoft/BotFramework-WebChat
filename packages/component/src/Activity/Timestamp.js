import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import TimeAgo from '../Utils/TimeAgo';

const Timestamp = ({ activity: { timestamp }, 'aria-hidden': ariaHidden, className, styleSet }) => (
  <span aria-hidden={ariaHidden} className={classNames(styleSet.timestamp + '', className + '')}>
    <TimeAgo value={timestamp} />
  </span>
);

Timestamp.defaultProps = {
  'aria-hidden': true,
  className: ''
};

Timestamp.propTypes = {
  activity: PropTypes.shape({
    timestamp: PropTypes.string.isRequired
  }).isRequired,
  'aria-hidden': PropTypes.bool,
  className: PropTypes.string,
  styleSet: PropTypes.shape({
    timestamp: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(Timestamp);
