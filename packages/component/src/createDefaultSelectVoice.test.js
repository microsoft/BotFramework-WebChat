/**
 * @jest-environment node
 */

/* global global */

import createDefaultSelectVoice from './createDefaultSelectVoice';

const VOICES = [
  {
    lang: 'en-UK'
  },
  {
    lang: 'en-US'
  },
  {
    lang: 'ja-JP'
  },
  {
    lang: 'zh-HK'
  }
];

beforeEach(() => {
  global.window = { navigator: { language: 'ja-JP' } };
});

test('Select voice based on activity locale', () => {
  const selectVoice = createDefaultSelectVoice('en-US');
  const actual = selectVoice(VOICES, { locale: 'zh-HK' });

  expect(actual).toHaveProperty('lang', 'zh-HK');
});

test('Select voice based on options', () => {
  const selectVoice = createDefaultSelectVoice('en-UK');
  const actual = selectVoice(VOICES, { locale: 'en-XX' });

  expect(actual).toHaveProperty('lang', 'en-UK');
});

test('Select voice based on browser', () => {
  const selectVoice = createDefaultSelectVoice('en-XX');
  const actual = selectVoice(VOICES, { locale: 'en-XX' });

  expect(actual).toHaveProperty('lang', 'ja-JP');
});

test('Select voice of "en-US"', () => {
  global.window.navigator.language = 'en-XX';

  const selectVoice = createDefaultSelectVoice('en-XX');
  const actual = selectVoice(VOICES, { locale: 'en-XX' });

  expect(actual).toHaveProperty('lang', 'en-US');
});

test('Select first voice', () => {
  const selectVoice = createDefaultSelectVoice('en-XX');
  const actual = selectVoice([{ lang: 'ko-KR' }], { locale: 'en-XX' });

  expect(actual).toHaveProperty('lang', 'ko-KR');
});

test('Prefer voice powered by deep neural network', () => {
  const voices = [
    {
      lang: 'en-US',
      name: 'Jessa'
    },
    {
      lang: 'en-US',
      name: 'GuyNeural'
    }
  ];

  const selectVoice = createDefaultSelectVoice('en-US');
  const actual = selectVoice(voices, { locale: 'en-US' });

  expect(actual).toHaveProperty('name', 'GuyNeural');
});
