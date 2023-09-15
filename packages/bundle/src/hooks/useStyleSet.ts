import { hooks } from 'botframework-webchat-component';

import type AdaptiveCardsStyleSet from '../adaptiveCards/AdaptiveCardsStyleSet';

const useMinimalStyleSet = hooks.useStyleSet;

type MinimalStyleSet = ReturnType<typeof useMinimalStyleSet>[0];

export default function useStyleSet(): readonly [MinimalStyleSet & AdaptiveCardsStyleSet] {
  const [styleOptions] = useMinimalStyleSet();

  return Object.freeze([styleOptions as MinimalStyleSet & AdaptiveCardsStyleSet] as const);
}
