import PropTypes from 'prop-types';
import React from 'react';

import { getLocaleString } from '../Localization/Localize';
import ScreenReaderText from '../ScreenReaderText';
import useLanguage from '../hooks/useLanguage';
import useLocalize from '../hooks/useLocalize';

const AbsoluteTime = ({ value }) => {
  const language = useLanguage();
  const localizedTime = getLocaleString(value, language);
  const label = useLocalize('SentAt');

  return (
    <React.Fragment>
      <ScreenReaderText text={label + localizedTime} />
      <span aria-hidden={true}>{localizedTime}</span>
    </React.Fragment>
  );
};

AbsoluteTime.propTypes = {
  value: PropTypes.string.isRequired
};

export default AbsoluteTime;
