import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React, { type ReactNode } from 'react';

import AbsoluteTime from './AbsoluteTime';
import RelativeTime from './private/RelativeTime';

const { useStyleOptions } = hooks;

type TimestampProps = Readonly<{
  timestamp: string;
}>;

const Timestamp = ({ timestamp }: TimestampProps): ReactNode => {
  const [{ timestampFormat }] = useStyleOptions();

  return timestampFormat === 'relative' ? <RelativeTime value={timestamp} /> : <AbsoluteTime value={timestamp} />;
};

Timestamp.propTypes = {
  timestamp: PropTypes.string.isRequired
};

export default Timestamp;
