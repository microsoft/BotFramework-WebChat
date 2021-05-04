import getTranscriptScrollableElement from '../pageElements/transcriptScrollable';

export default function scrollToTop(offset = 0) {
  const transcriptScrollable = getTranscriptScrollableElement();

  transcriptScrollable.scrollTop =
    offset < 0 ? transcriptScrollable.scrollHeight - transcriptScrollable.offsetHeight + offset : offset;
}
