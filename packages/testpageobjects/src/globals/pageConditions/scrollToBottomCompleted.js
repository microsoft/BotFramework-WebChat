import became from './became';
import getTranscriptScrollableElement from '../pageElements/transcriptScrollable';
import sleep from '../../utils/sleep';

export default function scrollToBottomCompleted() {
  let count = 0;

  return became(
    'scroll to bottom completed',
    async () => {
      // Browser may keep rendering content. Wait until 5 consecutive completion checks are all truthy.
      const scrollable = getTranscriptScrollableElement();

      if (scrollable && scrollable.offsetHeight + scrollable.scrollTop === scrollable.scrollHeight) {
        count++;

        if (count >= 5) {
          return true;
        }
      } else {
        count = 0;
      }

      await sleep(17);

      return false;
    },
    5000
  );
}
