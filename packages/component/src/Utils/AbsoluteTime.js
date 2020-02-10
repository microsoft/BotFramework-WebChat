import PropTypes from 'prop-types';
import React from 'react';

import ScreenReaderText from '../ScreenReaderText';

import useLocalizeCallback from '../hooks/useLocalizeCallback';
import useLocalizeDateCallback from '../hooks/useLocalizeDateCallback';

const AbsoluteTime = ({ value }) => {
  const localize = useLocalizeCallback();
  const localizeDate = useLocalizeDateCallback();

  const absoluteTime = localizeDate(value);

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENT_AT', absoluteTime)} />
      <span aria-hidden={true}>{absoluteTime}</span>
    </React.Fragment>
  );
};

AbsoluteTime.propTypes = {
  value: PropTypes.string.isRequired
};

export default AbsoluteTime;
