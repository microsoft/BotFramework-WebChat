// Strings commented out are pending official translations

import arEG from './ar-EG.json';
import arJO from './ar-JO.json';
import arSA from './ar-SA.json';
import bgBG from './bg-BG.json';
import caES from './ca-ES.json';
import csCZ from './cs-CZ.json';
import daDK from './da-DK.json';
import deDE from './de-DE.json';
import elGR from './el-GR.json';
import enUS from './en-US.json';
import esES from './es-ES.json';
import etEE from './et-EE.json';
import euES from './eu-ES.json';
import fiFI from './fi-FI.json';
import frFR from './fr-FR.json';
import glES from './gl-ES.json';
import heIL from './he-IL.json';
import hiIN from './hi-IN.json';
import hrHR from './hr-HR.json';
import huHU from './hu-HU.json';
import idID from './id-ID.json';
import itIT from './it-IT.json';
import jaJP from './ja-JP.json';
import kkKZ from './kk-KZ.json';
import koKR from './ko-KR.json';
import ltLT from './lt-LT.json';
import lvLV from './lv-LV.json';
import msMY from './ms-MY.json';
import nbNO from './nb-NO.json';
import nlNL from './nl-NL.json';
import plPL from './pl-PL.json';
import ptBR from './pt-BR.json';
import ptPT from './pt-PT.json';
import roRO from './ro-RO.json';
import ruRU from './ru-RU.json';
import skSK from './sk-SK.json';
import slSI from './sl-SI.json';
import srCyrlCS from './sr-Cyrl-CS.json';
import srLatnCS from './sr-Latn-CS.json';
import svSE from './sv-SE.json';
import thTH from './th-TH.json';
import trTR from './tr-TR.json';
import ukUA from './uk-UA.json';
import viVN from './vi-VN.json';
import yue from './yue.json';
import zhCN from './zh-CN.json';
import zhHK from './zh-HK.json';
import zhTW from './zh-TW.json';

import bundledOverrides from './overrides.json';
import mergeLocalizedStrings from './mergeLocalizedStrings';

let localizedStrings;

function getAllLocalizedStrings() {
  return (
    localizedStrings ||
    (localizedStrings = mergeLocalizedStrings(
      {
        'ar-EG': arEG,
        'ar-JO': arJO,
        'ar-SA': arSA,
        'bg-BG': bgBG,
        'ca-ES': caES,
        'cs-CZ': csCZ,
        'da-DK': daDK,
        'de-DE': deDE,
        'el-GR': elGR,
        'en-US': enUS,
        'es-ES': esES,
        'et-EE': etEE,
        'eu-ES': euES,
        'fi-FI': fiFI,
        'fr-FR': frFR,
        'gl-ES': glES,
        'he-IL': heIL,
        'hi-IN': hiIN,
        'hr-HR': hrHR,
        'hu-HU': huHU,
        'id-ID': idID,
        'it-IT': itIT,
        'ja-JP': jaJP,
        'kk-KZ': kkKZ,
        'ko-KR': koKR,
        'lt-LT': ltLT,
        'lv-LV': lvLV,
        'ms-MY': msMY,
        'nb-NO': nbNO,
        'nl-NL': nlNL,
        'pl-PL': plPL,
        'pt-BR': ptBR,
        'pt-PT': ptPT,
        'ro-RO': roRO,
        'ru-RU': ruRU,
        'sk-SK': skSK,
        'sl-SI': slSI,
        'sr-Cyrl': srCyrlCS,
        'sr-Latn': srLatnCS,
        'sv-SE': svSE,
        'th-TH': thTH,
        'tr-TR': trTR,
        'uk-UA': ukUA,
        'vi-VN': viVN,
        yue,
        'zh-Hans': zhCN,
        'zh-Hant': zhTW,
        'zh-Hans-SG': zhCN,
        'zh-Hant-HK': zhHK,
        'zh-Hant-MO': zhTW
      },
      bundledOverrides
    ))
  );
}

export default getAllLocalizedStrings;
