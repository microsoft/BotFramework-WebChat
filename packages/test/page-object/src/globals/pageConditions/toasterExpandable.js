import became from './became';
import getToaster from '../pageElements/toaster';

export default function toasterExpandable() {
  return became('toaster is expandable', () => getToaster().matches('.webchat__toaster--expandable'), 1000);
}
