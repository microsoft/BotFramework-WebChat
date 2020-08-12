import { timeouts } from '../constants.json';

// selenium-webdriver API doc:
// https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html

jest.setTimeout(timeouts.test);

xtest('useReplaceEmoticon should NOT convert text with emoticon to text with emoji when disabled', async () => {
  const { pageObjects } = await setupWebDriver();

  await expect(pageObjects.runHook('useReplaceEmoticon', [], fn => fn('hi :) <3 :( :sheep:'))).resolves.toBe(
    `hi :) <3 :( :sheep:`
  );
});

xtest('useReplaceEmoticon should convert text with emoticon to text with emoji when enabled', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        emojiSet: true
      }
    }
  });

  await expect(pageObjects.runHook('useReplaceEmoticon', [], fn => fn('hi :( <3 :sheep:'))).resolves.toBe(
    `hi ☹️ ❤️ :sheep:`
  );
});

test('useReplaceEmoticon should convert text with custom emoticon to text with custom emoji', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        emojiSet: { ':sheep:': '🐑' }
      }
    }
  });

  await expect(
    pageObjects.runHook('useReplaceEmoticon', [], fn => fn({ selectionStart: 12, value: '<3 :( :sheep:' }))
  ).resolves.toBe(`<3 :( 🐑`);
});

test('replaceEmoticon, when using a sorted custom emojiSet, should convert :o but :o) will not be converted', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        emojiSet: { ':o': '😲', ':o)': '🤡' }
      }
    }
  });

  await expect(pageObjects.runHook('useReplaceEmoticon', [], fn => fn(':o)'))).resolves.toBe(`😲)`);
});

test('replaceEmoticon, when using a unsorted custom emojiSet, should convert :o but :o) will not be converted', async () => {
  const { pageObjects } = await setupWebDriver({
    props: {
      styleOptions: {
        emojiSet: { ':o)': '🤡', ':o': '😲' }
      }
    }
  });

  await expect(pageObjects.runHook('useReplaceEmoticon', [], fn => fn(':o)'))).resolves.toBe(`😲)`);
});

// new test: emoticon with different selectionStart
// :) => emoji => undo, continue typing => should not convert emoticon again

// copy-paste text; two test cases:
// early in text has emoticon: ":) Hi!"
// at the end of the text: "Hi! :)"
// fix: post-R10
