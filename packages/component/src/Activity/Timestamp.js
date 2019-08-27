import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import AbsoluteTime from '../Utils/AbsoluteTime';
import RelativeTime from '../Utils/RelativeTime';
import useStyleSet from '../../lib/hooks/useStyleSet';

const Timestamp = ({ activity: { timestamp }, className }) => {
  const styleSet = useStyleSet();

  if (!timestamp) {
    return false;
  }

  return (
    <span className={classNames(styleSet.timestamp + '', (className || '') + '')}>
      {styleSet.options.timestampFormat === 'relative' ? (
        <RelativeTime value={timestamp} />
      ) : (
        <AbsoluteTime value={timestamp} />
      )}
    </span>
  );
};

Timestamp.defaultProps = {
  className: ''
};

Timestamp.propTypes = {
  activity: PropTypes.shape({
    timestamp: PropTypes.string.isRequired
  }).isRequired,
  className: PropTypes.string
};

export default Timestamp;
