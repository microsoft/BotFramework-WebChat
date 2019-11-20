import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return reference grammar ID', async () => {
  const { pageObjects } = await setupWebDriver({
    createDirectLine: options => {
      const workingDirectLine = window.WebChat.createDirectLine(options);

      return {
        activity$: workingDirectLine.activity$,
        connectionStatus$: workingDirectLine.connectionStatus$,
        getSessionId: workingDirectLine.getSessionId.bind(workingDirectLine),
        postActivity: workingDirectLine.postActivity.bind(workingDirectLine),
        referenceGrammarId: '12345678-1234-5678-abcd-12345678abcd'
      };
    }
  });

  const [referenceGrammarID] = await pageObjects.runHook('useReferenceGrammarID');

  expect(referenceGrammarID).toBe('12345678-1234-5678-abcd-12345678abcd');
});

test('setter should be falsy', async () => {
  const { pageObjects } = await setupWebDriver();
  const [_, setReferenceGrammarID] = await pageObjects.runHook('useReferenceGrammarID');

  expect(setReferenceGrammarID).toBeFalsy();
});
