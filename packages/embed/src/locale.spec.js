import { normalize, toAzureLocale } from './locale';

test('Normalizing "en.en-us"', () => {
  expect(normalize('en.en-us')).toBe('en-US');
});

test('Normalizing "bg.bg-bg"', () => {
  expect(normalize('bg.bg-bg')).toBe('bg-BG');
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
  expect(normalize('zh-hans.zh-cn')).toBe('zh-HANS');
});

test('Normalizing "zh-hant.zh-tw"', () => {
  expect(normalize('zh-hant.zh-tw')).toBe('zh-HANT');
});

test('Normalizing "en.zh-hk" should become "en-US"', () => {
  expect(normalize('en.zh-hk')).toBe('en-US');
});

test('Normalizing "en"', () => {
  expect(normalize('en')).toBe('en-US');
});

test('Normalizing "zh-HK"', () => {
  expect(normalize('zh-HK')).toBe('zh-HK');
});

test('Normalizing "*"', () => {
  expect(normalize('*')).toBe('en-US');
});

test('Convert "en-US" to Azure locale', () => {
  expect(toAzureLocale('en-US')).toBe('en.en-us');
});

test('Convert "fr" to Azure locale', () => {
  expect(toAzureLocale('fr')).toBe('fr.fr-fr');
});

test('Convert "pt-BR" to Azure locale', () => {
  expect(toAzureLocale('pt-BR')).toBe('pt-br.pt-br');
});

test('Convert "pt-PT" to Azure locale', () => {
  expect(toAzureLocale('pt-PT')).toBe('pt-pt.pt-pt');
});

test('Convert "zh-CN" to Azure locale', () => {
  expect(toAzureLocale('zh-CN')).toBe('zh-hans.zh-cn');
});

test('Convert "zh-HANT" to Azure locale', () => {
  expect(toAzureLocale('zh-HANT')).toBe('zh-hant.zh-tw');
});

test('Convert "zh-HANS" to Azure locale', () => {
  expect(toAzureLocale('zh-HANS')).toBe('zh-hans.zh-cn');
});

test('Convert "zh-HK" to Azure locale', () => {
  expect(toAzureLocale('zh-HK')).toBe('zh-hant.zh-hk');
});

test('Convert "zh-MO" to Azure locale', () => {
  expect(toAzureLocale('zh-MO')).toBe('zh-hant.zh-mo');
});

test('Convert "zh-SG" to Azure locale', () => {
  expect(toAzureLocale('zh-SG')).toBe('zh-hans.zh-sg');
});

test('Convert "zh-TW" to Azure locale', () => {
  expect(toAzureLocale('zh-TW')).toBe('zh-hant.zh-tw');
});

test('Convert "*" to Azure locale', () => {
  expect(toAzureLocale('*')).toEqual(undefined);
});
