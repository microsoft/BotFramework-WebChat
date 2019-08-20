/**
 * @jest-environment node
 */

import selectVoice from './defaultSelectVoice';

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
  const actual = selectVoice(VOICES, { language: 'en-US' }, { locale: 'zh-HK' });

  expect(actual).toHaveProperty('lang', 'zh-HK');
});

test('Select voice based on options', () => {
  const actual = selectVoice(VOICES, { language: 'en-UK' }, { locale: 'en-XX' });

  expect(actual).toHaveProperty('lang', 'en-UK');
});

test('Select voice based on browser', () => {
  const actual = selectVoice(VOICES, { language: 'en-XX' }, { locale: 'en-XX' });

  expect(actual).toHaveProperty('lang', 'ja-JP');
});

test('Select voice of "en-US"', () => {
  global.window.navigator.language = 'en-XX';

  const actual = selectVoice(VOICES, { language: 'en-XX' }, { locale: 'en-XX' });

  expect(actual).toHaveProperty('lang', 'en-US');
});

test('Select first voice', () => {
  const actual = selectVoice([{ lang: 'ko-KR' }], { language: 'en-XX' }, { locale: 'en-XX' });

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

  const actual = selectVoice(voices, { language: 'en-US' }, { locale: 'en-US' });

  expect(actual).toHaveProperty('name', 'GuyNeural');
});
