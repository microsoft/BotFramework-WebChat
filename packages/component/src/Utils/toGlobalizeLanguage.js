export default function toGlobalizeLanguage(language) {
  language = language.toLowerCase();

  if (language === 'ar-eg') {
    return 'ar-EG';
  } else if (language.startsWith('ar')) {
    return 'ar-SA';
  } else if (language.startsWith('bg')) {
    return 'bg';
  } else if (language.startsWith('cs')) {
    return 'cs';
  } else if (language.startsWith('da')) {
    return 'da';
  } else if (language.startsWith('de')) {
    return 'de';
  } else if (language.startsWith('el')) {
    return 'el';
  } else if (language.startsWith('en')) {
    return 'en';
  } else if (language.startsWith('es')) {
    return 'es';
  } else if (language.startsWith('fi')) {
    return 'fi';
  } else if (language.startsWith('fr')) {
    return 'fr';
  } else if (language.startsWith('hu')) {
    return 'hu';
  } else if (language.startsWith('it')) {
    return 'it';
  } else if (language.startsWith('ja')) {
    return 'ja';
  } else if (language.startsWith('ko')) {
    return 'ko';
  } else if (language.startsWith('lv')) {
    return 'lv';
  } else if (language.startsWith('nb')) {
    return 'nb';
  } else if (language.startsWith('nl')) {
    return 'nl';
  } else if (language.startsWith('pl')) {
    return 'pl';
  } else if (language === 'pt-pt') {
    return 'pt-PT';
  } else if (language.startsWith('pt')) {
    return 'pt';
  } else if (language.startsWith('ru')) {
    return 'ru';
  } else if (language.startsWith('sv')) {
    return 'sv';
  } else if (language.startsWith('tr')) {
    return 'tr';
  } else if (language === 'zh-hant') {
    return 'zh-HANT';
  } else if (language === 'zh-yue') {
    return 'yue';
  } else if (language.startsWith('zh')) {
    return 'zh-HANS';
  }

  return 'en';
}
