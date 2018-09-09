import { connect } from 'react-redux';
import React from 'react';

import enUS from './en-US';
import zhHANT from './zh-HANT';
import zhYUE from './zh-YUE';

function getStrings(language) {
  switch (language) {
    case 'zh-HANT':
      return zhHANT;

    case 'zh-YUE':
      return zhYUE;

    default:
      return enUS;
  }
}

function getString(text, language, args) {
  const string = (getStrings(language) || {})[text] || enUS[text];

  if (typeof string === 'function') {
    return string(args);
  } else {
    return string;
  }
}

const String = ({ language, text }) => getString(text, language)

export default connect(({ settings: { language } }) => ({ language }))(String)

export { getString }
