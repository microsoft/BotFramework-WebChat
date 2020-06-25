import getTranscriptScrollableElement from '../elements/transcriptScrollable';

function sleep(durationMS = 17) {
  return new Promise(resolve => setTimeout(resolve, durationMS));
}

// Returns true if every value is unique.
function unique(array) {
  return new Set(array).size === array.length;
}

const COUNT = 5;

export default function scrolling() {
  const scrollTops = [];

  return {
    message: `scrolling (${COUNT} consecutive measurements showing different scroll positions)`,
    fn: async () => {
      scrollTops.push(getTranscriptScrollableElement().scrollTop);

      while (scrollTops.length > COUNT) {
        scrollTops.splice(0, 1);
      }

      if (scrollTops.length === COUNT && unique(scrollTops)) {
        return true;
      }

      await sleep();

      return false;
    }
  };
}
