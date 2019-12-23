import PropTypes from 'prop-types';
import React from 'react';

import useIntervalSince from '../hooks/useIntervalSince';
import ScreenReaderText from '../ScreenReaderText';
import useLocalize from '../hooks/useLocalize';
import useLocalizeDate from '../hooks/useLocalizeDate';

const TIMER_INTERVAL = 60000;

const RelativeTime = ({ value }) => {
  const localizedAbsoluteTime = useLocalize('SentAt') + useLocalizeDate(value);
  const text = useLocalize('X minutes ago', value);

  useIntervalSince(value, TIMER_INTERVAL);

  return (
    <React.Fragment>
      <ScreenReaderText text={localizedAbsoluteTime} />
      <span aria-hidden={true}>{text}</span>
    </React.Fragment>
  );
};

RelativeTime.propTypes = {
  value: PropTypes.string.isRequired
};

export default RelativeTime;
