import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React from 'react';

import ScreenReaderText from '../../ScreenReaderText';

const { useDateFormatter, useLocalizer } = hooks;

const AbsoluteTime = ({ hide, value }) => {
  const localize = useLocalizer();
  const formatDate = useDateFormatter();

  const absoluteTime = formatDate(value);

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENT_AT', absoluteTime)} />
      {!hide && <span aria-hidden={true}>{absoluteTime}</span>}
    </React.Fragment>
  );
};

AbsoluteTime.defaultProps = {
  hide: false
};

AbsoluteTime.propTypes = {
  hide: PropTypes.bool,
  value: PropTypes.string.isRequired
};

export default AbsoluteTime;
