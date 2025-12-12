import getScrollToBottomButton from '../elements/getScrollToBottomButton';

export default async function clickScrollToBottomButton(driver) {
  const scrollToBottomButton = await getScrollToBottomButton(driver);

  await scrollToBottomButton.click();
}
