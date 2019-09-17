import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return image and initial of avatar for bot', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        botAvatarImage: 'about:blank#bot-icon',
        botAvatarInitials: 'WC'
      }
    }
  });

  const [{ image, initials }] = await pageObjects.runHook('useAvatarForBot');

  expect({ image, initials }).toMatchInlineSnapshot(`
    Object {
      "image": "about:blank#bot-icon",
      "initials": "WC",
    }
  `);
});

test('setter should throw exception', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(pageObjects.runHook('useAvatarForBot', [], result => result[1]())).rejects.toThrow();
});
