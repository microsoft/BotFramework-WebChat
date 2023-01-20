import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling voiceSelector should use selectVoice from props', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      locale: 'en-US',
      selectVoice: voices => voices.find(({ lang }) => lang === 'zh-YUE'),
      webSpeechPonyfillFactory: () => window.WebSpeechMock
    }
  });

  await expect(
    pageObjects.runHook('useVoiceSelector', [{ language: 'en-US' }], selectVoice =>
      selectVoice([
        {
          default: false,
          lang: 'zh-YUE',
          localService: true,
          name: 'Mock Voice (zh-YUE)',
          voiceURI: 'mock://web-speech/voice/zh-YUE'
        },
        {
          default: false,
          lang: 'en-US',
          localService: true,
          name: 'Mock Voice (en-US)',
          voiceURI: 'mock://web-speech/voice/en-US'
        }
      ])
    )
  ).resolves.toMatchInlineSnapshot(`
    Object {
      "default": false,
      "lang": "zh-YUE",
      "localService": true,
      "name": "Mock Voice (zh-YUE)",
      "voiceURI": "mock://web-speech/voice/zh-YUE",
    }
  `);
});
