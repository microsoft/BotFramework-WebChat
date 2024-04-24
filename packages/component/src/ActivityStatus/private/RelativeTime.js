import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import ScreenReaderText from '../../ScreenReaderText';
import useForceRenderAtInterval from '../../hooks/internal/useForceRenderAtInterval';

const { useDateFormatter, useLocalizer, useRelativeTimeFormatter } = hooks;

const TIMER_INTERVAL = 60000;

const RelativeTime = ({ value }) => {
  const formatDate = useDateFormatter();
  const formatRelativeTime = useRelativeTimeFormatter();
  const localize = useLocalizer();

  useForceRenderAtInterval(value, TIMER_INTERVAL);

  return (
    <Fragment>
      <ScreenReaderText text={localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENT_AT', formatDate(value))} />
      <span aria-hidden={true}>{formatRelativeTime(value)}</span>
    </Fragment>
  );
};

RelativeTime.propTypes = {
  value: PropTypes.string.isRequired
};

export default RelativeTime;
