import { createBasicStyleSet } from 'react-film';

export default function createSuggestedActionsStyleSet() {
  // This is not CSS, but options to create style set for react-film
  return createBasicStyleSet({
    flipperBoxWidth: 40,
    flipperSize: 20,
    scrollBarHeight: 6,
    scrollBarMargin: 2
  });
}
