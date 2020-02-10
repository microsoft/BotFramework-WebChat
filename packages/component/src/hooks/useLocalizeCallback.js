import { useCallback } from 'react';

import normalizeLanguage from '../Utils/normalizeLanguage';
import useLanguage from './useLanguage';

import enUS from '../../src/Localization/en-US.json';
import zhYUE from '../../src/Localization/zh-YUE.json';

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

    case 'zh-YUE':
      return zhYUE;

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
