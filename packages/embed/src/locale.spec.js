import { normalize, toAzureLocale } from './locale';

test('Normalizing "en.en-us"', () => {
  expect(normalize('en.en-us')).toBe('en-US');
});

test('Normalize "ja.ja-jp"', () => {
  expect(normalize('ja.ja-jp')).toBe('ja-JP');
});

test('Normalize "zh-hant.zh-hk"', () => {
  expect(normalize('zh-hant.zh-hk')).toBe('zh-HK');
});

test('Normalizing "en"', () => {
  expect(normalize('en')).toBe('en');
});

test('Normalizing "zh-HK"', () => {
  expect(normalize('zh-HK')).toBe('zh-HK');
});

test('Normalizing "*"', () => {
  expect(normalize('*')).toBe('en');
});

test('Convert "en-US" to Azure locale', () => {
  expect(toAzureLocale('en-US')).toBe('en.en-us');
});

test('Convert "en" to Azure locale', () => {
  expect(toAzureLocale('en')).toBe('en');
});

test('Convert "zh-HK" to Azure locale', () => {
  expect(toAzureLocale('zh-HK')).toBe('zh.zh-hk');
});
