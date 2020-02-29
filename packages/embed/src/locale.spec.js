import { normalize, toAzureLocale } from './locale';

test('Normalizing "en.en-us"', () => {
  expect(normalize('en.en-us')).toBe('en-US');
});

test('Normalizing "cs.cs-cz"', () => {
  expect(normalize('cs.cs-cz')).toBe('cs-CZ');
});

test('Normalizing "de.de-de"', () => {
  expect(normalize('de.de-de')).toBe('de-DE');
});

test('Normalizing "es.es-es"', () => {
  expect(normalize('es.es-es')).toBe('es-ES');
});

test('Normalizing "fr.fr-fr"', () => {
  expect(normalize('fr.fr-fr')).toBe('fr-FR');
});

test('Normalizing "hu.hu-hu"', () => {
  expect(normalize('hu.hu-hu')).toBe('hu-HU');
});

test('Normalizing "it.it-it"', () => {
  expect(normalize('it.it-it')).toBe('it-IT');
});

test('Normalizing "ja.ja-jp"', () => {
  expect(normalize('ja.ja-jp')).toBe('ja-JP');
});

test('Normalizing "ko.ko-kr"', () => {
  expect(normalize('ko.ko-kr')).toBe('ko-KR');
});

test('Normalizing "nl.nl-nl"', () => {
  expect(normalize('nl.nl-nl')).toBe('nl-NL');
});

test('Normalizing "pl.pl-pl"', () => {
  expect(normalize('pl.pl-pl')).toBe('pl-PL');
});

test('Normalizing "pt-br.pt-br"', () => {
  expect(normalize('pt-br.pt-br')).toBe('pt-BR');
});

test('Normalizing "pt-pt.pt-pt"', () => {
  expect(normalize('pt-pt.pt-pt')).toBe('pt-PT');
});

test('Normalizing "ru.ru-ru"', () => {
  expect(normalize('ru.ru-ru')).toBe('ru-RU');
});

test('Normalizing "sv.sv-se"', () => {
  expect(normalize('sv.sv-se')).toBe('sv-SE');
});

test('Normalizing "tr.tr-tr"', () => {
  expect(normalize('tr.tr-tr')).toBe('tr-TR');
});

test('Normalizing "zh-hans.zh-cn"', () => {
  expect(normalize('zh-hans.zh-cn')).toBe('zh-Hans');
});

test('Normalizing "zh-hans.zh-sg"', () => {
  expect(normalize('zh-hans.zh-sg')).toBe('zh-Hans-SG');
});

test('Normalizing "zh-hant.zh-hk"', () => {
  expect(normalize('zh-hant.zh-hk')).toBe('zh-Hant-HK');
});

test('Normalizing "zh-hant.zh-mo"', () => {
  expect(normalize('zh-hant.zh-mo')).toBe('zh-Hant-MO');
});

test('Normalizing "zh-hant.zh-tw"', () => {
  expect(normalize('zh-hant.zh-tw')).toBe('zh-Hant');
});

test('Normalizing "en.zh-hk" should become "en-US"', () => {
  expect(normalize('en.zh-hk')).toBe('en-US');
});

test('Normalizing "en"', () => {
  expect(normalize('en')).toBe('en-US');
});

test('Normalizing "zh-Hant-HK"', () => {
  expect(normalize('zh-Hant-HK')).toBe('zh-Hant-HK');
});

test('Normalizing "*"', () => {
  expect(normalize('*')).toBe('en-US');
});

test('Convert "fr" to Azure locale', () => {
  expect(toAzureLocale('fr')).toBe('fr.fr-fr');
});

test('Convert "*" to Azure locale', () => {
  expect(toAzureLocale('*')).toEqual(undefined);
});

test('Convert all Azure supported languages to Azure locale', () => {
  const expected = {
    'ar-EG': undefined,
    'ar-JO': undefined,
    'ar-SA': undefined,
    'bg-BG': undefined,
    'ca-ES': undefined,
    'cs-CZ': 'cs.cs-cz',
    'da-DK': undefined,
    'de-DE': 'de.de-de',
    'el-GR': undefined,
    'en-US': 'en.en-us',
    'es-ES': 'es.es-es',
    'et-EE': undefined,
    'eu-ES': undefined,
    'fi-FI': undefined,
    'fr-FR': 'fr.fr-fr',
    'gl-ES': undefined,
    'he-IL': undefined,
    'hi-IN': undefined,
    'hr-HR': undefined,
    'hu-HU': 'hu.hu-hu',
    'id-ID': undefined,
    'it-IT': 'it.it-it',
    'ja-JP': 'ja.ja-jp',
    'kk-KZ': undefined,
    'ko-KR': 'ko.ko-kr',
    'lt-LT': undefined,
    'lv-LV': undefined,
    'ms-MY': undefined,
    'nb-NO': undefined,
    'nl-NL': 'nl.nl-nl',
    'pl-PL': 'pl.pl-pl',
    'pt-BR': 'pt-br.pt-br',
    'pt-PT': 'pt-pt.pt-pt',
    'ro-RO': undefined,
    'ru-RU': 'ru.ru-ru',
    'sk-SK': undefined,
    'sl-SI': undefined,
    'sr-Cyrl': undefined,
    'sr-Latn': undefined,
    'sv-SE': 'sv.sv-se',
    'th-TH': undefined,
    'tr-TR': 'tr.tr-tr',
    'uk-UA': undefined,
    'vi-VN': undefined,
    yue: 'zh-hant.zh-hk',
    'zh-Hans': 'zh-hans.zh-cn',
    'zh-Hans-SG': 'zh-hans.zh-sg',
    'zh-Hant': 'zh-hant.zh-tw',
    'zh-Hant-HK': 'zh-hant.zh-hk',
    'zh-Hant-MO': 'zh-hant.zh-mo'
  };

  const actual = Object.keys(expected).reduce(
    (actual, language) => ({ ...actual, [language]: toAzureLocale(language) }),
    {}
  );

  expect(actual).toEqual(expected);
});
