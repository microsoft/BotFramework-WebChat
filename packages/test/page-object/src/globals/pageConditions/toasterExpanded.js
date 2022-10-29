import became from './became';
import getToaster from '../pageElements/toaster';

export default function toasterExpanded(expanded = true) {
  return became(
    `toaster is ${expanded ? '' : 'not '}expanded`,
    () => getToaster().matches('.webchat__toaster--expanded') === expanded,
    1000
  );
}
