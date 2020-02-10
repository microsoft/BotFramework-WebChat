// Localize is designed to be elaboratively return multiple results and possibly exceeding complexity requirement
/* eslint complexity: "off" */

import getLocaleString from './getLocaleString';
import getRTLList from './getRTLList';
import useLocalize from '../hooks/useLocalize';

import arEG from './ar-EG';
import arJO from './ar-JO';
import bgBG from './bg-BG';
import csCZ from './cs-CZ';
import daDK from './da-DK';
import deDE from './de-DE';
import elGR from './el-GR';
import enUS from './en-US';
import esES from './es-ES';
import fiFI from './fi-FI';
import frFR from './fr-FR';
import heIL from './he-IL';
import huHU from './hu-HU';
import itIT from './it-IT';
import jaJP from './ja-JP';
import koKR from './ko-KR';
import lvLV from './lv-LV';
import nbNO from './nb-NO';
import nlNL from './nl-NL';
import plPL from './pl-PL';
import ptBR from './pt-BR';
import ptPT from './pt-PT';
import ruRU from './ru-RU';
import svSE from './sv-SE';
import trTR from './tr-TR';
import zhHANS from './zh-HANS';
import zhHANT from './zh-HANT';
import zhYUE from './zh-YUE';

function getStrings(language) {
  switch (language) {
    case 'ar-EG':
      return arEG;
    case 'ar-JO':
      return arJO;
    case 'bg-BG':
      return bgBG;
    case 'cs-CZ':
      return csCZ;
    case 'da-DK':
      return daDK;
    case 'de-DE':
      return deDE;
    case 'el-GR':
      return elGR;
    case 'es-ES':
      return esES;
    case 'fi-FI':
      return fiFI;
    case 'fr-FR':
      return frFR;
    case 'he-IL':
      return heIL;
    case 'hu-HU':
      return huHU;
    case 'it-IT':
      return itIT;
    case 'ja-JP':
      return jaJP;
    case 'ko-KR':
      return koKR;
    case 'lv-LV':
      return lvLV;
    case 'nb-NO':
      return nbNO;
    case 'nl-NL':
      return nlNL;
    case 'pl-PL':
      return plPL;
    case 'pt-BR':
      return ptBR;
    case 'pt-PT':
      return ptPT;
    case 'ru-RU':
      return ruRU;
    case 'sv-SE':
      return svSE;
    case 'tr-TR':
      return trTR;
    case 'zh-HANS':
      return zhHANS;
    case 'zh-HANT':
      return zhHANT;
    case 'zh-YUE':
      return zhYUE;

    default:
      return enUS;
  }
}

function localize(text, language, ...args) {
  const string = (getStrings(language) || {})[text] || enUS[text];

  if (typeof string === 'function') {
    return string(...args);
  }

  return string || text;
}

export default ({ args, text }) => useLocalize(text, ...(args || []));

export { getLocaleString, getRTLList, localize };
