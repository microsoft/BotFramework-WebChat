import getSuggestedActions from '../pageElements/suggestedActions';

export default function clickNthSuggestedAction(nth) {
  const suggestedAction = getSuggestedActions()[nth - 1];

  if (!suggestedAction) {
    throw new Error(`Cannot find suggested action at ${nth}`);
  }

  return host.click(suggestedAction);
}
