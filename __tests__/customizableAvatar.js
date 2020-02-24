import { imageSnapshotOptions, timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('customizable avatar', () => {
  const defaultProps = {
    avatarMiddleware: () => next => args => {
      const { activity } = args;
      const { text = '' } = activity;

      if (~text.indexOf('override avatar')) {
        return () =>
          React.createElement(
            'div',
            {
              style: {
                alignItems: 'center',
                backgroundColor: 'Red',
                borderRadius: 4,
                color: 'White',
                display: 'flex',
                fontFamily: "'Calibri', 'Helvetica Neue', 'Arial', 'sans-serif'",
                height: 128,
                justifyContent: 'center',
                width: 64
              }
            },
            React.createElement('div', {}, activity.from.role)
          );
      } else if (~text.indexOf('no avatar')) {
        return false;
      }

      return next(args);
    },
    styleOptions: {
      botAvatarBackgroundColor: '#77F',
      botAvatarInitials: 'WC',
      userAvatarBackgroundColor: '#F77',
      userAvatarInitials: 'WW'
    }
  };

  const fullCustomizedProps = {
    ...defaultProps,
    styleOptions: {
      ...defaultProps.styleOptions,
      bubbleBorderColor: 'Black',
      bubbleBorderRadius: 10,
      bubbleFromUserBorderColor: 'Black',
      bubbleFromUserBorderRadius: 10,
      bubbleFromUserNubOffset: 5,
      bubbleFromUserNubSize: 10,
      bubbleNubOffset: 5,
      bubbleNubSize: 10
    }
  };

  test('with default avatar', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      height: 768,
      props: defaultProps
    });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('normal');
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('override avatar');
    await driver.wait(minNumActivitiesShown(4), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('no avatar');
    await driver.wait(minNumActivitiesShown(6), timeouts.directLine);

    await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);

    await pageObjects.updateProps({
      styleOptions: {
        botAvatarInitials: undefined,
        userAvatarInitials: undefined
      }
    });

    await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('with default avatar, bubble nub, and round bubble', async () => {
    const { driver, pageObjects } = await setupWebDriver({
      height: 768,
      props: fullCustomizedProps
    });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('normal');
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('override avatar');
    await driver.wait(minNumActivitiesShown(4), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('no avatar');
    await driver.wait(minNumActivitiesShown(6), timeouts.directLine);

    await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);

    await pageObjects.updateProps({
      ...fullCustomizedProps,
      styleOptions: {
        ...fullCustomizedProps.styleOptions,
        botAvatarInitials: undefined,
        userAvatarInitials: undefined
      }
    });

    await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);
  });

  describe('in RTL', () => {
    test('with default avatar', async () => {
      const props = {
        ...defaultProps,
        locale: 'ar-EG'
      };

      const { driver, pageObjects } = await setupWebDriver({
        height: 768,
        props
      });

      await driver.wait(uiConnected(), timeouts.directLine);
      await pageObjects.sendMessageViaSendBox('normal');
      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
      await pageObjects.sendMessageViaSendBox('override avatar');
      await driver.wait(minNumActivitiesShown(4), timeouts.directLine);
      await pageObjects.sendMessageViaSendBox('no avatar');
      await driver.wait(minNumActivitiesShown(6), timeouts.directLine);

      await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);

      await pageObjects.updateProps({
        ...props,
        styleOptions: {
          ...props.styleOptions,
          botAvatarInitials: undefined,
          userAvatarInitials: undefined
        }
      });

      await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);
    });

    test('with default avatar, bubble nub, and round bubble', async () => {
      const props = {
        ...fullCustomizedProps,
        locale: 'ar-EG'
      };

      const { driver, pageObjects } = await setupWebDriver({
        height: 768,
        props
      });

      await driver.wait(uiConnected(), timeouts.directLine);
      await pageObjects.sendMessageViaSendBox('normal');
      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);
      await pageObjects.sendMessageViaSendBox('override avatar');
      await driver.wait(minNumActivitiesShown(4), timeouts.directLine);
      await pageObjects.sendMessageViaSendBox('no avatar');
      await driver.wait(minNumActivitiesShown(6), timeouts.directLine);

      await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);

      await pageObjects.updateProps({
        ...props,
        styleOptions: {
          ...props.styleOptions,
          botAvatarInitials: undefined,
          userAvatarInitials: undefined
        }
      });

      await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);
    });
  });
});
