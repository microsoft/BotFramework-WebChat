import became from './became';
import getTranscriptScrollableElement from '../pageElements/transcriptScrollable';
import sleep from '../../utils/sleep';

// Returns true if every value is unique.
function unique(array) {
  return new Set(array).size === array.length;
}

const COUNT = 5;

export default function scrolling() {
  const scrollTops = [];

  return became(
    `scrolling (${COUNT} consecutive measurements showing different scroll positions)`,
    async () => {
      scrollTops.push(getTranscriptScrollableElement().scrollTop);

      while (scrollTops.length > COUNT) {
        scrollTops.splice(0, 1);
      }

      if (scrollTops.length === COUNT && unique(scrollTops)) {
        return true;
      }

      await sleep(17);

      return false;
    },
    1000
  );
}
