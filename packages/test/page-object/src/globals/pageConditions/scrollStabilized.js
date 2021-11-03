import getTranscriptScrollableElement from '../pageElements/transcriptScrollable';
import stabilized from './stabilized';

export default function scrollStabilized(scrollTop) {
  const transcriptScrollable = getTranscriptScrollableElement();

  if (typeof scrollTop === 'number') {
    return stabilized(
      `scroll is at ${scrollTop}px and`,
      () => (Math.abs(transcriptScrollable.scrollTop - scrollTop) <= 1 ? scrollTop : {}),
      5,
      5000
    );
  }

  return stabilized('scroll', () => transcriptScrollable.scrollTop, 5, 5000);
}
