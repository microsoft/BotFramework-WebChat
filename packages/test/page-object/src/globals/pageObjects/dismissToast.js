import became from '../pageConditions/became';
import getToastDismissButtons from '../pageElements/toastDismissButtons';

export default async function dismissToast(index) {
  const toastDismissButtons = getToastDismissButtons();

  const toastDismissButton = toastDismissButtons[+index];

  if (!toastDismissButton) {
    throw new Error(
      `Cannot find toast dismiss button of index ${index}, there are ${toastDismissButtons.length} dismiss buttons visually.`
    );
  }

  await host.click(toastDismissButton);

  await became('toast to dismiss', () => getToastDismissButtons().length === toastDismissButtons.length - 1, 1000);
}
