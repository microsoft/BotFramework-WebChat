import became from './became';
import getToaster from '../pageElements/toaster';

export default function toasterExpandable(expandable = true) {
  return became(
    'toaster is expandable',
    () => getToaster().matches('.webchat__toaster--expandable') === expandable,
    1000
  );
}
