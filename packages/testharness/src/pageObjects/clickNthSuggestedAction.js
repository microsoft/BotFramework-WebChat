import getSuggestedActions from '../elements/suggestedActions';

const { Simulate } = window.ReactTestUtils;

export default async function clickNthSuggestedAction(nth) {
  const suggestedAction = getSuggestedActions()[nth - 1];

  console.log(getSuggestedActions());
  console.log(suggestedAction);

  if (!suggestedAction) {
    throw new Error(`Cannot find suggested action at ${nth}`);
  }

  Simulate.click(suggestedAction);
}
