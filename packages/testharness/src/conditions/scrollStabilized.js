import getTranscriptScrollableElement from '../elements/transcriptScrollable';

function sleep(durationMS = 17) {
  return new Promise(resolve => setTimeout(resolve, durationMS));
}

const COUNT = 5;

export default function scrollStabilized() {
  const scrollTops = [];

  return {
    message: `scroll stabilized after ${COUNT} counts`,
    fn: async () => {
      scrollTops.push(getTranscriptScrollableElement().scrollTop);

      while (scrollTops.length > COUNT) {
        scrollTops.splice(0, 1);
      }

      if (scrollTops.length === COUNT && scrollTops.every(scrollTop => scrollTop === scrollTops[0])) {
        return true;
      }

      await sleep();

      return false;
    }
  };
}
