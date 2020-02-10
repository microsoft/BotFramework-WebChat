import { useCallback } from 'react';

import useLanguage from './useLanguage';

import enUS from '../../src/Localization/en-US.json';

function normalizeLanguage(language) {
  language = language.toLowerCase();

  if (language.startsWith('ar')) {
    return 'ar-EG';
  } else if (language.startsWith('bg')) {
    return 'bg-BG';
  } else if (language.startsWith('cs')) {
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
  } else if (language.startsWith('nb') || language.startsWith('nn') || language.startsWith('no')) {
    return 'nb-NO';
  } else if (language.startsWith('nl')) {
    return 'nl-NL';
  } else if (language.startsWith('pl')) {
    return 'pl-PL';
  } else if (language === 'pt-br') {
    return 'pt-BR';
  } else if (language.startsWith('pt')) {
    return 'pt-PT';
  } else if (language.startsWith('ru')) {
    return 'ru-RU';
  } else if (language.startsWith('sv')) {
    return 'sv-SE';
  } else if (language.startsWith('tr')) {
    return 'tr-TR';
  } else if (language === 'zh-yue') {
    return 'zh-YUE';
  } else if (language === 'zh-hant' || language === 'zh-hk' || language === 'zh-mo' || language === 'zh-tw') {
    return 'zh-HANT';
  } else if (language.startsWith('zh')) {
    return 'zh-HANS';
  }

  return 'en-US';
}

function getStrings(language) {
  switch (normalizeLanguage(language || '')) {
    // case 'ar-EG':
    //   return arEG;
    // case 'bg-BG':
    //   return bgBG;
    // case 'cs-CZ':
    //   return csCZ;
    // case 'da-DK':
    //   return daDK;
    // case 'de-DE':
    //   return deDE;
    // case 'el-GR':
    //   return elGR;
    // case 'es-ES':
    //   return esES;
    // case 'fi-FI':
    //   return fiFI;
    // case 'fr-FR':
    //   return frFR;
    // case 'hu-HU':
    //   return huHU;
    // case 'it-IT':
    //   return itIT;
    // case 'ja-JP':
    //   return jaJP;
    // case 'ko-KR':
    //   return koKR;
    // case 'lv-LV':
    //   return lvLV;
    // case 'nb-NO':
    //   return nbNO;
    // case 'nl-NL':
    //   return nlNL;
    // case 'pl-PL':
    //   return plPL;
    // case 'pt-BR':
    //   return ptBR;
    // case 'pt-PT':
    //   return ptPT;
    // case 'ru-RU':
    //   return ruRU;
    // case 'sv-SE':
    //   return svSE;
    // case 'tr-TR':
    //   return trTR;
    // case 'zh-HANS':
    //   return zhHANS;
    // case 'zh-HANT':
    //   return zhHANT;
    // case 'zh-YUE':
    //   return zhYUE;

    default:
      return enUS;
  }
}

export default function useLocalizeCallback() {
  const [language] = useLanguage();

  return useCallback(
    (id, ...args) =>
      Object.entries(args).reduce((str, [index, arg]) => str.replace(`${index}`, arg), getStrings(language)[id]),
    [language]
  );
}
