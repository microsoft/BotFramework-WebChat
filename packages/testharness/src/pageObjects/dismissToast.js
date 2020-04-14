import getToastDismissButtons from '../elements/toastDismissButtons';
import wait from './wait';

const { Simulate } = window.ReactTestUtils;

export default async function dismissToast(index) {
  const toastDismissButtons = getToastDismissButtons();
  const toastDismissButton = toastDismissButtons[index];

  if (!toastDismissButton) {
    throw new Error(
      `Cannot find toast dismiss button of index ${index}, there are ${toastDismissButtons.length} dismiss buttons visually.`
    );
  }

  Simulate.click(toastDismissButton);

  await wait(() => getToastDismissButtons().length === toastDismissButtons.length - 1);
}
