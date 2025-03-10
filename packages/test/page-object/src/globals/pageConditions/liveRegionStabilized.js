import getLiveRegion from '../pageElements/liveRegion';
import stabilized from './stabilized';

export default function liveRegionStabilized() {
  return stabilized('live region', () => getLiveRegion().children.length, 5, 5000);
}
