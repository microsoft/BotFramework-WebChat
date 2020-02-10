export default function normalizeLanguage(language) {
  language = language.toLowerCase();

  if (language === 'ar-eg') {
    return 'ar-EG';
  } else if (language === 'ar-jo') {
    return 'ar-JO';
  } else if (language.startsWith('ar')) {
    return 'ar-SA';
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
