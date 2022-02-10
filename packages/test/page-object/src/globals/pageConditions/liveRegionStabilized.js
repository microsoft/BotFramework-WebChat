import getTranscriptLiveRegion from '../pageElements/transcriptLiveRegion';
import stabilized from './stabilized';

export default function liveRegionStabilized() {
  return stabilized('live region', () => getTranscriptLiveRegion().children.length, 5, 5000);
}
