import getTranscriptScrollableElement from '../pageElements/transcriptScrollable';
import stabilized from './stabilized';

export default function scrollToBottomCompleted() {
  return stabilized(
    'scroll is at bottom and',
    () => {
      const scrollable = getTranscriptScrollableElement();
      const { offsetHeight, scrollHeight, scrollTop } = scrollable;

      // Browser may keep rendering content. Wait until consecutively:
      // 1. Scroll position is at the bottom
      // 2. Scroll top does not move

      // If it is not at the bottom, create a new empty object and return it, so it will fail the consecutive test.
      return Math.abs(offsetHeight + scrollTop - scrollHeight) <= 1 ? scrollTop : {};
    },
    5,
    5000
  );
}
