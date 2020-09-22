import { imageSnapshotOptions, timeouts } from './__jest__/constants.json';

import allImagesLoaded from './__jest__/conditions/allImagesLoaded';
import minNumActivitiesShown from './__jest__/conditions/minNumActivitiesShown';
import uiConnected from './__jest__/conditions/uiConnected';
import getActivityElements from './__jest__/elements/getActivityElements';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

test('show ZIP files with contentUrl', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    createDirectLine: options => {
      const directLine = window.WebChat.createDirectLine(options);
      const patchedDirectLine = {
        activity$: new Observable(observer => {
          const subscription = directLine.activity$.subscribe({
            next(activity) {
              observer.next(
                Object.assign({}, activity, {
                  attachments: (activity.attachments || []).map(attachment =>
                    Object.assign({}, attachment, {
                      contentUrl: 'https://example.org/'
                    })
                  )
                })
              );
            }
          });

          return () => subscription.unsubscribe();
        }),

        connectionStatus$: directLine.connectionStatus$,
        postActivity: directLine.postActivity.bind(directLine),
        token: directLine.token
      };

      return patchedDirectLine;
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendFile('empty.zip');
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);

  const [firstActivity, secondActivity] = await getActivityElements(driver);

  await expect(
    driver.executeScript(
      firstActivity => firstActivity.querySelector('a[target="_blank"]').getAttribute('href'),
      firstActivity
    )
  ).resolves.toEqual('https://example.org/');

  await expect(
    driver.executeScript(
      firstActivity => firstActivity.querySelector('a[target="_blank"]').getAttribute('download'),
      firstActivity
    )
  ).resolves.toEqual('empty.zip');

  await expect(
    driver.executeScript(
      secondActivity => secondActivity.querySelector('a[target="_blank"]').getAttribute('href'),
      secondActivity
    )
  ).resolves.toEqual('https://example.org/');

  await expect(
    driver.executeScript(
      secondActivity => secondActivity.querySelector('a[target="_blank"]').getAttribute('download'),
      secondActivity
    )
  ).resolves.toEqual('empty.zip');
});

test('show ZIP files without contentUrl', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    createDirectLine: options => {
      const directLine = window.WebChat.createDirectLine(options);
      const patchedDirectLine = {
        activity$: new Observable(observer => {
          const subscription = directLine.activity$.subscribe({
            next(activity) {
              observer.next(
                Object.assign({}, activity, {
                  attachments: (activity.attachments || []).map(attachment =>
                    Object.assign({}, attachment, {
                      contentUrl: undefined
                    })
                  )
                })
              );
            }
          });

          return () => subscription.unsubscribe();
        }),

        connectionStatus$: directLine.connectionStatus$,
        postActivity: directLine.postActivity.bind(directLine),
        token: directLine.token
      };

      return patchedDirectLine;
    }
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendFile('empty.zip');
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);

  await expect(
    driver.executeScript(() => !!document.querySelector('[role="listitem"]:nth-child(1) a'))
  ).resolves.toBeFalsy();
  await expect(
    driver.executeScript(() => !!document.querySelector('[role="listitem"]:nth-child(2) a'))
  ).resolves.toBeFalsy();
  await expect(
    driver.executeScript(() => !!document.querySelector('[role="listitem"]:nth-child(1) a'))
  ).resolves.toBeFalsy();
});
