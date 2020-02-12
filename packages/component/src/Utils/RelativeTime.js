import PropTypes from 'prop-types';
import React from 'react';

import ScreenReaderText from '../ScreenReaderText';
import useForceRenderAtInterval from '../hooks/internal/useForceRenderAtInterval';
import useLocalizer from '../hooks/useLocalizer';
import useLocalizerForDate from '../hooks/useLocalizerForDate';
import useLocalizerForRelativeTime from '../hooks/useLocalizerForRelativeTime';

const TIMER_INTERVAL = 60000;

const RelativeTime = ({ value }) => {
  const localize = useLocalizer();
  const localizeDate = useLocalizerForDate();
  const localizeRelativeTime = useLocalizerForRelativeTime();

  useForceRenderAtInterval(value, TIMER_INTERVAL);

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENT_AT', localizeDate(value))} />
      <span aria-hidden={true}>{localizeRelativeTime(value)}</span>
    </React.Fragment>
  );
};

RelativeTime.propTypes = {
  value: PropTypes.string.isRequired
};

export default RelativeTime;
