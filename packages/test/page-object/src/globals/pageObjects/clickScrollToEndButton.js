import getScrollToEndButton from '../pageElements/scrollToEndButton';

export default function clickScrollToEndButton() {
  const scrollToEndButton = getScrollToEndButton();

  if (!scrollToEndButton) {
    throw new Error('Cannot find scroll to end button');
  }

  return host.click(scrollToEndButton);
}
