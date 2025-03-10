import became from '../pageConditions/became';
import getToasterHeader from '../pageElements/toasterHeader';
import getToasts from '../pageElements/toasts';

export default async function clickToasterHeader() {
  const { length } = getToasts();
  const toasterHeader = getToasterHeader();
  const willExpand = !length;

  if (!toasterHeader) {
    throw new Error('Cannot click toaster header because the header cannot be found.');
  }

  await host.click(toasterHeader);

  await became(`Toaster to ${willExpand ? 'expand' : 'collapse'}`, () => !!getToasts().length === willExpand, 1000);
}
