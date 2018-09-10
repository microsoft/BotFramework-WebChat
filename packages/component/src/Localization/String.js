import { connect } from 'react-redux';
import React from 'react';

import enUS from './en-US';
import jaJP from './ja-JP';
import zhHANT from './zh-HANT';
import zhYUE from './zh-YUE';

function getStrings(language) {
  switch (normalizeLanguage(language || '')) {
    case 'ja-JP': return jaJP;
    case 'zh-HANT': return zhHANT;
    case 'zh-YUE': return zhYUE;

    default:
      return enUS;
  }
}

function getString(text, language, args) {
  const string = (getStrings(language) || {})[text] || enUS[text];

  if (typeof string === 'function') {
    return string(args);
  } else {
    return string || text;
  }
}

const String = ({ args, language, text }) => getString(text, language, args);

export default connect(({ settings: { language } }) => ({ language }))(String)

export { getString }

function normalizeLanguage(language) {
  language = language.toLowerCase();

  if (language.startsWith('cs')) {
    return 'cs-CZ';
  } else if (language.startsWith('da')) {
    return 'da-DK';
  } else if (language.startsWith('de')) {
    return 'de-DE';
  } else if (language.startsWith('el')) {
    return 'el-GR';
  } else if (language.startsWith('es')) {
    return 'es-ES';
  } else if (language.startsWith('fi')) {
    return 'fi-FI';
  } else if (language.startsWith('fr')) {
    return 'fr-FR';
  } else if (language.startsWith('hu')) {
    return 'hu-HU';
  } else if (language.startsWith('it')) {
    return 'it-IT';
  } else if (language.startsWith('ja')) {
    return 'ja-JP';
  } else if (language.startsWith('ko')) {
    return 'ko-KR';
  } else if (language.startsWith('lv')) {
    return 'lv-LV';
  } else if (
    language.startsWith('nb')
    || language.startsWith('nn')
    || language.startsWith('no')
  ) {
    return 'nb-NO';
  } else if (language.startsWith('nl')) {
    return 'nl-NL';
  } else if (language.startsWith('pl')) {
    return 'pl-PL';
  } else if (language.startsWith('pt')) {
    if (language === 'pt-BR') {
      return 'pt-BR';
    } else {
      return 'pt-PT';
    }
  } else if (language.startsWith('ru')) {
    return 'ru-RU';
  } else if (language.startsWith('sv')) {
    return 'sv-SE';
  } else if (language.startsWith('tr')) {
    return 'tr-TR';
  } else if (language.startsWith('zh')) {
    if (language === 'zh-yue') {
      return 'zh-YUE';
    } else if (
      language === 'zh-hant'
      || language === 'zh-hk'
      || language === 'zh-mo'
      || language === 'zh-tw'
    ) {
      return 'zh-HANT';
    } else {
      return 'zh-HANS';
    }
  }

  return 'en-US';
}
