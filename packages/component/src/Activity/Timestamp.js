import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import AbsoluteTime from '../Utils/AbsoluteTime';
import RelativeTime from '../Utils/RelativeTime';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';

const Timestamp = ({ activity: { timestamp }, 'aria-hidden': ariaHidden, className }) => {
  const [{ timestampFormat }] = useStyleOptions();
  const [{ timestamp: timestampStyleSet, sendStatus: sendStatusStyleSet }] = useStyleSet();

  timestampStyleSet &&
    console.warn(
      'Web Chat: styleSet.timestamp is being deprecated. Please use styleSet.sendStatus. This deprecation migration will be removed on or after December 31, 2021.'
    );

  if (!timestamp) {
    return false;
  }

  return (
    <span
      aria-hidden={ariaHidden}
      className={classNames((timestampStyleSet || sendStatusStyleSet) + '', (className || '') + '')}
    >
      {timestampFormat === 'relative' ? <RelativeTime value={timestamp} /> : <AbsoluteTime value={timestamp} />}
    </span>
  );
};

Timestamp.defaultProps = {
  'aria-hidden': false,
  className: ''
};

Timestamp.propTypes = {
  activity: PropTypes.shape({
    timestamp: PropTypes.string.isRequired
  }).isRequired,
  'aria-hidden': PropTypes.bool,
  className: PropTypes.string
};

export default Timestamp;
