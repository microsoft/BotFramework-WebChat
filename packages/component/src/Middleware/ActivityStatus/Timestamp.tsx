import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { FC } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import AbsoluteTime from './AbsoluteTime';
import RelativeTime from './RelativeTime';
import useStyleSet from '../../hooks/useStyleSet';

const { useStyleOptions } = hooks;

type TimestampProps = {
  activity: WebChatActivity;
  className?: string;
};

const Timestamp: FC<TimestampProps> = ({ activity: { timestamp }, className }) => {
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
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  activity: PropTypes.shape({
    timestamp: PropTypes.string
  }).isRequired,
  className: PropTypes.string
};

export default Timestamp;
