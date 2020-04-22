import getTranscriptScrollable from '../elements/transcriptScrollable';

const { Simulate } = window.ReactTestUtils;

export default function scrollToTop() {
  const transcriptScrollable = getTranscriptScrollable();

  transcriptScrollable.scrollTop = 0;

  Simulate.scroll(transcriptScrollable);
}
