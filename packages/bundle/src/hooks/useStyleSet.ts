import { hooks } from 'botframework-webchat-component';

import type AdaptiveCardsStyleSet from '../adaptiveCards/AdaptiveCardsStyleSet';

const useMinimalStyleSet = hooks.useStyleSet;

type MinimalStyleSet = ReturnType<typeof useMinimalStyleSet>[0];

export default function useStyleSet(): [MinimalStyleSet & AdaptiveCardsStyleSet] {
  const [styleOptions] = useMinimalStyleSet();

  return [styleOptions as MinimalStyleSet & AdaptiveCardsStyleSet];
}
