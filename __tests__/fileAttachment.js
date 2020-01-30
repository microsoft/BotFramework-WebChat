import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import uiConnected from './setup/conditions/uiConnected';

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

  await expect(
    driver.executeScript(() =>
      document.querySelector('[role="listitem"]:nth-child(1) a[target="_blank"]').getAttribute('href')
    )
  ).resolves.toEqual('https://example.org/');
  await expect(
    driver.executeScript(() =>
      document.querySelector('[role="listitem"]:nth-child(2) a[target="_blank"]').getAttribute('href')
    )
  ).resolves.toEqual('https://example.org/');
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
});
