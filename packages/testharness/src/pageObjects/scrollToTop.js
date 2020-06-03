import getTranscriptScrollable from '../elements/transcriptScrollable';

const { Simulate } = window.ReactTestUtils;

export default function scrollToTop(offset = 0) {
  const transcriptScrollable = getTranscriptScrollable();

  transcriptScrollable.scrollTop = offset < 0 ? transcriptScrollable.scrollHeight - transcriptScrollable.offsetHeight + offset : offset;

  Simulate.scroll(transcriptScrollable);
}
