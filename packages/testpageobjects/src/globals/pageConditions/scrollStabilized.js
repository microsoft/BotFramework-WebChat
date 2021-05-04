import getTranscriptScrollableElement from '../pageElements/transcriptScrollable';
import stabilized from './stabilized';

export default async function scrollStabilized() {
  const transcriptScrollable = getTranscriptScrollableElement();

  return await stabilized('scroll', () => transcriptScrollable.scrollTop, 5, 5000);
}
