import getliveRegion from '../pageElements/liveRegion';
import stabilized from './stabilized';

export default function liveRegionStabilized() {
  return stabilized('live region', () => getliveRegion().children.length, 5, 5000);
}
