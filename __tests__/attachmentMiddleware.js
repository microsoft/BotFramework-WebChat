import { imageSnapshotOptions, timeouts } from './constants.json';

import allImagesLoaded from './setup/conditions/allImagesLoaded';
import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

// This test use a custom middleware that call the same downstream middleware twice to render.
// Then merge two renders into a single component.
// In real world, there could be multiple downstream middleware in the chain.
// We found this bug only affect if we call the same instance of downstream middleware more than once.
// https://github.com/microsoft/BotFramework-WebChat/issues/2838
test('file upload should show thumbnail and file name', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      attachmentMiddleware: () => next => ({
        activity = {},
        activity: { from: { role } } = {},
        attachment,
        attachment: { contentType, thumbnailUrl } = {}
      }) => {
        if (role === 'user' && /^image\//u.test(contentType) && thumbnailUrl) {
          const patchedAttachment = Object.assign({}, attachment, {
            contentType: 'application/octet-stream',
            thumbnailUrl: undefined
          });

          const patchedAttachments = activity.attachments.map(target =>
            target === attachment ? patchedAttachment : target
          );

          const patchedActivity = Object.assign({}, activity, {
            attachments: patchedAttachments
          });

          return React.createElement(
            React.Fragment,
            {},
            next({ activity, attachment }),
            next({ activity: patchedActivity, attachment: patchedAttachment })
          );
        }

        return next({ activity, attachment });
      }
    },
    // TODO: [P3] Offline bot did not reply with a downloadable attachment, we need to use production bot
    useProductionBot: true
  });

  await driver.wait(uiConnected(), timeouts.directLine);

  await pageObjects.sendFile('seaofthieves.jpg');
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
  await driver.wait(allImagesLoaded(), timeouts.fetchImage);

  const base64PNG = await driver.takeScreenshot();

  expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
});
