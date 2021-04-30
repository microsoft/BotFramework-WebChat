import became from './became';
import getTranscriptScrollableElement from '../../elements/transcriptScrollable';

const COUNT = 5;
const WAIT_INTERVAL = 17;

export default async function scrollStabilized(message) {
  const scrollTops = [];

  await became(
    `scroll stabilized after ${COUNT} counts${message ? ': ' + message : ''}`,
    async () => {
      const value = getTranscriptScrollableElement().scrollTop;

      scrollTops.push(value);

      while (scrollTops.length > COUNT) {
        scrollTops.shift();
      }

      if (scrollTops.length === COUNT && scrollTops.every(scrollTop => scrollTop === scrollTops[0])) {
        return true;
      }

      await new Promise(resolve => setTimeout(resolve, WAIT_INTERVAL));

      return false;
    },
    5000
  );
}
