import getSuggestedActionButtons from '../elements/getSuggestedActionButtons';

export default async function clickSuggestedActionButton(driver, index) {
  const suggestedActions = await getSuggestedActionButtons(driver);

  await suggestedActions[index].click();
}
