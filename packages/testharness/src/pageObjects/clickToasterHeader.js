import getToasterHeader from '../elements/toasterHeader';
import getToasts from '../elements/toasts';
import wait from './wait';

const { Simulate } = window.ReactTestUtils;

export default async function clickToasterHeader() {
  const { length } = getToasts();
  const toasterHeader = getToasterHeader();
  const willExpand = !length;

  if (!toasterHeader) {
    throw new Error('Cannot click toaster header because the header cannot be found.');
  }

  Simulate.click(toasterHeader);

  await wait(() => !!getToasts().length === willExpand);
}
