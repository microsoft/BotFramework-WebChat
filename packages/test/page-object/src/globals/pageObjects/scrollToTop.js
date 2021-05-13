import getTranscriptScrollableElement from '../pageElements/transcriptScrollable';
import scrollStabilized from '../pageConditions/scrollStabilized';

export default async function scrollToTop(offset = 0) {
  // Before scrolling to top, wait until the scroll is stabilized.
  await scrollStabilized();

  const transcriptScrollable = getTranscriptScrollableElement();

  offset = offset < 0 ? transcriptScrollable.scrollHeight - transcriptScrollable.offsetHeight + offset : offset;

  transcriptScrollable.scrollTop = offset;

  await scrollStabilized(offset);
}
