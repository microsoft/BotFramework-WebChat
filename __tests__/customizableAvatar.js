import { imageSnapshotOptions, timeouts } from './constants.json';

import minNumActivitiesShown from './setup/conditions/minNumActivitiesShown';
import uiConnected from './setup/conditions/uiConnected';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

describe('customizable avatar', () => {
  const createDefaultProps = () => ({
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
                width: '100%'
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
  });

  const createFullCustomizedProps = args => {
    const props = createDefaultProps(args);

    return {
      ...props,
      styleOptions: {
        ...props.styleOptions,
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
  };

  test('with default avatar', async () => {
    const props = createDefaultProps();
    const { driver, pageObjects } = await setupWebDriver({
      height: 768,
      props,
      // TODO: [P1] #2954 Currently, offline MockBot has bugs that randomize the activity order.
      useProductionBot: true
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
    const props = createFullCustomizedProps();
    const { driver, pageObjects } = await setupWebDriver({
      height: 768,
      props,
      // TODO: [P1] #2954 Currently, offline MockBot has bugs that randomize the activity order.
      useProductionBot: true
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

  test('with default avatar only on one side', async () => {
    let props = createDefaultProps();

    props = { ...props, styleOptions: { ...props.styleOptions, userAvatarInitials: undefined } };

    const { driver, pageObjects } = await setupWebDriver({
      props,
      // TODO: [P1] #2954 Currently, offline MockBot has bugs that randomize the activity order.
      useProductionBot: true
    });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('normal');
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

    await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);

    props = createDefaultProps();
    props = { ...props, styleOptions: { ...props.styleOptions, botAvatarInitials: undefined } };

    await pageObjects.updateProps({
      ...props,
      styleOptions: {
        ...props.styleOptions,
        botAvatarInitials: undefined
      }
    });

    await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);
  });

  test('with default avatar, bubble nub, and round bubble only on one side', async () => {
    let props = createFullCustomizedProps();

    props = { ...props, styleOptions: { ...props.styleOptions, userAvatarInitials: undefined } };

    const { driver, pageObjects } = await setupWebDriver({
      props,
      // TODO: [P1] #2954 Currently, offline MockBot has bugs that randomize the activity order.
      useProductionBot: true
    });

    await driver.wait(uiConnected(), timeouts.directLine);
    await pageObjects.sendMessageViaSendBox('normal');
    await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

    await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);

    props = createFullCustomizedProps();
    props = { ...props, styleOptions: { ...props.styleOptions, botAvatarInitials: undefined } };

    await pageObjects.updateProps({
      ...props,
      styleOptions: {
        ...props.styleOptions,
        botAvatarInitials: undefined
      }
    });

    await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);
  });

  describe('in RTL', () => {
    test('with default avatar', async () => {
      const props = {
        ...createDefaultProps(),
        locale: 'ar-EG'
      };

      const { driver, pageObjects } = await setupWebDriver({
        height: 768,
        props,
        // TODO: [P1] #2954 Currently, offline MockBot has bugs that randomize the activity order.
        useProductionBot: true
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
        ...createFullCustomizedProps(),
        locale: 'ar-EG'
      };

      const { driver, pageObjects } = await setupWebDriver({
        height: 768,
        props,
        // TODO: [P1] #2954 Currently, offline MockBot has bugs that randomize the activity order.
        useProductionBot: true
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

    test('with default avatar only on one side', async () => {
      let props = createDefaultProps();

      props = { ...props, locale: 'ar-EG', styleOptions: { ...props.styleOptions, userAvatarInitials: undefined } };

      const { driver, pageObjects } = await setupWebDriver({
        props,
        // TODO: [P1] #2954 Currently, offline MockBot has bugs that randomize the activity order.
        useProductionBot: true
      });

      await driver.wait(uiConnected(), timeouts.directLine);
      await pageObjects.sendMessageViaSendBox('normal');
      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);

      props = createDefaultProps();
      props = { ...props, styleOptions: { ...props.styleOptions, botAvatarInitials: undefined } };

      await pageObjects.updateProps({
        ...props,
        styleOptions: {
          ...props.styleOptions,
          botAvatarInitials: undefined
        }
      });

      await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);
    });

    test('with default avatar, bubble nub, and round bubble only on one side', async () => {
      let props = createFullCustomizedProps();

      props = { ...props, locale: 'ar-EG', styleOptions: { ...props.styleOptions, userAvatarInitials: undefined } };

      const { driver, pageObjects } = await setupWebDriver({
        props,
        // TODO: [P1] #2954 Currently, offline MockBot has bugs that randomize the activity order.
        useProductionBot: true
      });

      await driver.wait(uiConnected(), timeouts.directLine);
      await pageObjects.sendMessageViaSendBox('normal');
      await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

      await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);

      props = createFullCustomizedProps();
      props = { ...props, styleOptions: { ...props.styleOptions, botAvatarInitials: undefined } };

      await pageObjects.updateProps({
        ...props,
        styleOptions: {
          ...props.styleOptions,
          botAvatarInitials: undefined
        }
      });

      await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);
    });
  });
});

test('customize size and roundness of avatar', async () => {
  const { driver, pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        avatarBorderRadius: '20%',
        avatarSize: 64,
        botAvatarInitials: 'WC',
        userAvatarInitials: 'WW'
      }
    },
    // TODO: [P1] #2954 Currently, offline MockBot has bugs that randomize the activity order.
    useProductionBot: true
  });

  await driver.wait(uiConnected(), timeouts.directLine);
  await pageObjects.sendMessageViaSendBox('normal');
  await driver.wait(minNumActivitiesShown(2), timeouts.directLine);

  await expect(driver.takeScreenshot()).resolves.toMatchImageSnapshot(imageSnapshotOptions);
});
