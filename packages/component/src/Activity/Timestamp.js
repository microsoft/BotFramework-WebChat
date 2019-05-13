import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import TimeAgo from '../Utils/TimeAgo';

const Timestamp = ({
  activity: { timestamp },
  className,
  styleSet
}) =>
  <span
    className={ classNames(
      styleSet.timestamp + '',
      className + ''
    ) }
  >
    <TimeAgo value={ timestamp } />
  </span>;

Timestamp.defaultProps = {
  className: ''
};

Timestamp.propTypes = {
  activity: PropTypes.shape({
    timestamp: PropTypes.string.isRequired
  }).isRequired,
  className: PropTypes.string,
  styleSet: PropTypes.shape({
    timestamp: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(Timestamp)
