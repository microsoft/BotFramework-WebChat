import getTranscriptScrollableElement from '../pageElements/transcriptScrollable';
import stabilized from './stabilized';
import sleep from '../../utils/sleep';

export default async function scrollToBottomCompleted() {
  await stabilized(
    'scroll is at bottom and',
    () => {
      const scrollable = getTranscriptScrollableElement();
      const { offsetHeight, scrollHeight, scrollTop } = scrollable;

      // Browser may keep rendering content. Wait until consecutively:
      // 1. Scroll position is at the bottom, and;
      // 2. Scroll is stabilized, i.e. `scrollTop` returns same value.

      // If it is not at the bottom, create a new empty object and return it, so it will fail the consecutive test.
      return Math.abs(offsetHeight + scrollTop - scrollHeight) <= 1 ? scrollTop : {};
    },
    5,
    5000
  );

  // TODO: This is probably a patch for test reliabilty. When we fix the root cause, remove this delay.
  await sleep(500);
}
