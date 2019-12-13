import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Constants } from 'botframework-webchat-core';

import AbsoluteTime from '../Utils/AbsoluteTime';
import RelativeTime from '../Utils/RelativeTime';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';

import SendStatus from './SendStatus';

const {
  ActivityClientState: { SENDING, SEND_FAILED }
} = Constants;

const Timestamp = ({ activity, 'aria-hidden': ariaHidden, className }) => {
  const { channelData: { state } = {}, timestamp } = activity;

  const [{ timestampFormat }] = useStyleOptions();
  const [{ timestamp: timestampStyleSet }] = useStyleSet();

  if (!timestamp) {
    return false;
  }

  return state === SENDING || state === SEND_FAILED ? (
    <SendStatus activity={activity} className="timestamp" />
  ) : (
    <span aria-hidden={ariaHidden} className={classNames(timestampStyleSet + '', (className || '') + '')}>
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
