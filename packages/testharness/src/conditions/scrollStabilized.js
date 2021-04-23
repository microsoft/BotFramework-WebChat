import getTranscriptScrollableElement from '../elements/transcriptScrollable';

function sleep(durationMS = 17) {
  return new Promise(resolve => setTimeout(resolve, durationMS));
}

const COUNT = 5;

export default function scrollStabilized(message) {
  const scrollTops = [];
  const start = Date.now();

  console.log(`t=0: START ${message}`);

  return {
    message: `scroll stabilized after ${COUNT} counts${message ? ': ' + message : ''}`,
    fn: async () => {
      const value = getTranscriptScrollableElement().scrollTop;

      console.log(`t=${Date.now() - start}: GOT ${value}`);

      scrollTops.push(value);

      while (scrollTops.length > COUNT) {
        scrollTops.shift();
      }

      if (scrollTops.length === COUNT && scrollTops.every(scrollTop => scrollTop === scrollTops[0])) {
        console.log(`t=${Date.now() - start}: DONE`);

        return true;
      }

      await sleep();

      return false;
    }
  };
}
