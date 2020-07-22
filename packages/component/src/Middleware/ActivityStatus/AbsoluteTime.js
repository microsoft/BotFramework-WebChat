import PropTypes from 'prop-types';
import React from 'react';

import ScreenReaderText from '../../ScreenReaderText';

import useDateFormatter from '../../hooks/useDateFormatter';
import useLocalizer from '../../hooks/useLocalizer';

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
