import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import AbsoluteTime from './AbsoluteTime';
import RelativeTime from './RelativeTime';
import useStyleOptions from '../../hooks/useStyleOptions';
import useStyleSet from '../../hooks/useStyleSet';

const Timestamp = ({ activity: { timestamp }, className }) => {
  const [{ timestampFormat }] = useStyleOptions();
  const [{ timestamp: timestampStyleSet, sendStatus: sendStatusStyleSet }] = useStyleSet();

  timestampStyleSet &&
    console.warn(
      'botframework-webchat: "styleSet.timestamp" is deprecated. Please use "styleSet.sendStatus". This deprecation migration will be removed on or after December 31, 2021.'
    );

  return (
    !!timestamp && (
      <span
        className={classNames((timestampStyleSet || '') + '', (sendStatusStyleSet || '') + '', (className || '') + '')}
      >
        {timestampFormat === 'relative' ? <RelativeTime value={timestamp} /> : <AbsoluteTime value={timestamp} />}
      </span>
    )
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
