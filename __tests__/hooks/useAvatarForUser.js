import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('getter should return image and initial of avatar for user', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        userAvatarImage: 'about:blank#user-icon',
        userAvatarInitials: 'WW'
      }
    }
  });

  const [{ image, initials }] = await pageObjects.runHook('useAvatarForUser');

  expect({ image, initials }).toMatchInlineSnapshot(`
    Object {
      "image": "about:blank#user-icon",
      "initials": "WW",
    }
  `);
});

test('setter should throw exception', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(pageObjects.runHook('useAvatarForUser', [], result => result[1]())).rejects.toThrow();
});
