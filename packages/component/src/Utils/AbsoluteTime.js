import PropTypes from 'prop-types';
import React from 'react';

import ScreenReaderText from '../ScreenReaderText';

import useLocalize from '../hooks/useLocalize';
import useLocalizeDate from '../hooks/useLocalizeDate';

const calculateAbsoluteTime = value => {
  const localizedTime = useLocalizeDate(value);
  const absTime = useLocalize('SentAt') + localizedTime;

  return absTime;
};

const AbsoluteTime = ({ value }) => {
  const absTime = calculateAbsoluteTime(value);

  return (
    <React.Fragment>
      <ScreenReaderText text={absTime} />
      <span aria-hidden={true}>{localizedTime}</span>
    </React.Fragment>
  );
};

AbsoluteTime.propTypes = {
  value: PropTypes.string.isRequired
};

export default AbsoluteTime;
export { calculateAbsoluteTime };
