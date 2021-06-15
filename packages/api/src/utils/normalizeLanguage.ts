/* eslint complexity: ["error", 100] */

// https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support

export default function normalizeLanguage(language: string): string {
  language = language.toLowerCase();

  if (language === 'ar-eg') {
    return 'ar-EG';
  } else if (language === 'ar-jo') {
    return 'ar-JO';
  } else if (language.startsWith('ar')) {
    return 'ar-SA';
  } else if (language.startsWith('bg')) {
    return 'bg-BG';
  } else if (language.startsWith('ca')) {
    return 'ca-ES';
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
  } else if (language.startsWith('et')) {
    return 'et-EE';
  } else if (language.startsWith('eu')) {
    return 'eu-ES';
  } else if (language.startsWith('fi')) {
    return 'fi-FI';
  } else if (language.startsWith('fr')) {
    return 'fr-FR';
  } else if (language.startsWith('gl')) {
    return 'gl-ES';
  } else if (language.startsWith('he')) {
    return 'he-IL';
  } else if (language.startsWith('hi')) {
    return 'hi-IN';
  } else if (language.startsWith('hr')) {
    return 'hr-HR';
  } else if (language.startsWith('hu')) {
    return 'hu-HU';
  } else if (language.startsWith('id')) {
    return 'id-ID';
  } else if (language.startsWith('it')) {
    return 'it-IT';
  } else if (language.startsWith('ja')) {
    return 'ja-JP';
  } else if (language.startsWith('kk')) {
    return 'kk-KZ';
  } else if (language.startsWith('ko')) {
    return 'ko-KR';
  } else if (language.startsWith('lt')) {
    return 'lt-LT';
  } else if (language.startsWith('lv')) {
    return 'lv-LV';
  } else if (language.startsWith('ms')) {
    return 'ms-MY';
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
  } else if (language.startsWith('ro')) {
    return 'ro-RO';
  } else if (language.startsWith('ru')) {
    return 'ru-RU';
  } else if (language.startsWith('sk')) {
    return 'sk-SK';
  } else if (language.startsWith('sl')) {
    return 'sl-SI';
  } else if (language.startsWith('sr-cyrl')) {
    return 'sr-Cyrl';
  } else if (language.startsWith('sr-latn')) {
    return 'sr-Latn';
  } else if (language.startsWith('sv')) {
    return 'sv-SE';
  } else if (language.startsWith('th')) {
    return 'th-TH';
  } else if (language.startsWith('tr')) {
    return 'tr-TR';
  } else if (language.startsWith('uk')) {
    return 'uk-UA';
  } else if (language.startsWith('vi')) {
    return 'vi-VN';
  } else if (language.startsWith('yue') || language === 'zh-yue') {
    language === 'zh-yue' &&
      console.warn(
        'botframework-webchat: The locale "zh-YUE" is being renamed to "yue" and deprecated. It will be removed on or after 2022-02-12.'
      );

    return 'yue';
  } else if (language === 'zh-hant' || language === 'zh-tw') {
    return 'zh-Hant';
  } else if (language === 'zh-hant-hk' || language === 'zh-hk') {
    return 'zh-Hant-HK';
  } else if (language === 'zh-hant-mo' || language === 'zh-mo') {
    return 'zh-Hant-MO';
  } else if (language === 'zh-hans-sg' || language === 'zh-sg') {
    return 'zh-Hans-SG';
  } else if (language.startsWith('zh')) {
    return 'zh-Hans';
  }

  return 'en-US';
}
