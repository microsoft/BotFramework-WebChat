import getScrollToBottomButton from '../elements/getScrollToBottomButton';

export default async function clickScrollToBottomButton(driver) {
  (await getScrollToBottomButton(driver)).click();
}
