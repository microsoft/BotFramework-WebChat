import { By, Key } from 'selenium-webdriver';
import { imageSnapshotOptions } from './constants.json';

function sleep(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

describe('suggested-actions command', async () => {

    test('should show response from bot and no text from user on imback', async () => {
        const { driver } = await setupWebDriver();

        await sleep(2000);

        const input = await driver.findElement(By.tagName('input[type="text"]'));

        await input.sendKeys('suggested-actions', Key.RETURN);
        await sleep(2000);

        const buttons = await driver.findElements(By.tagName('button'));

        const imBackButton = buttons[1];

        await imBackButton.click();
        await sleep(2000);

        const base64PNG = await driver.takeScreenshot();

        expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
    }, 60000);

    test('should show response from bot and no text from user on postback', async () => {
        const { driver } = await setupWebDriver();

        await sleep(2000);

        const input = await driver.findElement(By.tagName('input[type="text"]'));

        await input.sendKeys('suggested-actions', Key.RETURN);
        await sleep(2000);

        const buttons = await driver.findElements(By.tagName('button'));

        const postBackStringButton = buttons[2];

        await postBackStringButton.click();
        await sleep(2000);

        const base64PNG = await driver.takeScreenshot();

        expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
    }, 60000);

    test('should show response from bot and text from user on postback', async () => {
        const { driver } = await setupWebDriver();

        await sleep(2000);

        const input = await driver.findElement(By.tagName('input[type="text"]'));

        await input.sendKeys('suggested-actions', Key.RETURN);
        await sleep(2000);

        const buttons = await driver.findElements(By.tagName('button'));

        const postBackStringButton = buttons[3];

        await postBackStringButton.click();
        await sleep(2000);

        const base64PNG = await driver.takeScreenshot();

        expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
    }, 60000);


    test('should show response from bot and no text from user on messageback', async () => {
        const { driver } = await setupWebDriver();

        await sleep(2000);

        const input = await driver.findElement(By.tagName('input[type="text"]'));

        await input.sendKeys('suggested-actions', Key.RETURN);
        await sleep(2000);

        const buttons = await driver.findElements(By.tagName('button'));

        const postBackStringButton = buttons[4];

        await postBackStringButton.click();
        await sleep(2000);

        const base64PNG = await driver.takeScreenshot();

        expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
    }, 60000);

    test('should show response from bot and text from user on messageback', async () => {
        const { driver } = await setupWebDriver();

        await sleep(2000);

        const input = await driver.findElement(By.tagName('input[type="text"]'));

        await input.sendKeys('suggested-actions', Key.RETURN);
        await sleep(2000);

        const buttons = await driver.findElements(By.tagName('button'));

        const postBackStringButton = buttons[4];

        await postBackStringButton.click();
        await sleep(2000);

        const base64PNG = await driver.takeScreenshot();

        expect(base64PNG).toMatchImageSnapshot(imageSnapshotOptions);
    }, 60000);
});
