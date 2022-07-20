import type { AdaptiveCard, CardObject, ShowCardAction } from 'adaptivecards';

// TODO: [P2] Remove this when Adaptive Card fixed their bug #7606.
//            https://github.com/microsoft/AdaptiveCards/issues/7606
//            Currently, their findDOMNodeOwner() returns bad result when passing an Action attached to the card.
export default function findDOMNodeOwner(adaptiveCard: AdaptiveCard, element: HTMLElement): CardObject | undefined {
  for (let count = adaptiveCard.getActionCount(), index = 0; index < count; index++) {
    const action = adaptiveCard.getActionAt(index);

    if (action.renderedElement === element) {
      return action;
    }

    if (action.getJsonTypeName() === 'Action.ShowCard') {
      const { card } = action as ShowCardAction;
      const cardObject = card && findDOMNodeOwner(card, element);

      if (cardObject) {
        return cardObject;
      }
    }
  }

  return adaptiveCard.findDOMNodeOwner(element);
}
