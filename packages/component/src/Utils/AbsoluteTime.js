import PropTypes from 'prop-types';
import React from 'react';

import ScreenReaderText from '../ScreenReaderText';

import useLocalize from '../hooks/useLocalize';
import useLocalizeDate from '../hooks/useLocalizeDate';

const AbsoluteTime = ({ value }) => {
  const absTime = useLocalizeDate(value);
  const sentAtAbsTime = useLocalize('SentAt') + absTime;

  return (
    <React.Fragment>
      <ScreenReaderText text={sentAtAbsTime} />
      <span aria-hidden={true}>{absTime}</span>
    </React.Fragment>
  );
};

AbsoluteTime.propTypes = {
  value: PropTypes.string.isRequired
};

export default AbsoluteTime;
