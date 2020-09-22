import { timeouts } from '../__jest__/constants.json';

import minNumActivitiesShown from '../__jest__/conditions/minNumActivitiesShown';
import speechSynthesisUtterancePended from '../__jest__/conditions/speechSynthesisUtterancePended';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('calling markActivityAsSpoken should stop synthesize', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      webSpeechPonyfillFactory: () => window.WebSpeechMock
    }
  });

  await pageObjects.sendMessageViaMicrophone('Hello, World!');

  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(speechSynthesisUtterancePended(), timeouts.ui);

  const [activities] = await pageObjects.runHook('useActivities');

  await pageObjects.executePromiseScript(
    activity => {
      return window.WebChatTest.runHook('useMarkActivityAsSpoken').then(markActivityAsSpoken => {
        markActivityAsSpoken(activity);
      });
    },
    activities.find(({ from: { role }, speak }) => role === 'bot' && speak)
  );

  const [activitiesAfterMark] = await pageObjects.runHook('useActivities');

  expect(activitiesAfterMark.find(({ from: { role }, speak }) => role === 'bot' && speak)).toHaveProperty(
    'channelData.speak',
    false
  );

  // TODO: [P2] The following expectation does not work yet, we should understand and/or fix it.
  // await expect(pageObjects.speechSynthesisUtterancePended()).resolves.toBeTruthy();
});
