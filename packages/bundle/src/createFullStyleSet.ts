import { createStyleSet } from 'botframework-webchat-component';

import createAdaptiveCardsStyleSet from './adaptiveCards/Styles/createAdaptiveCardsStyleSet';
import FullBundleStyleOptions from './types/FullBundleStyleOptions';

// TODO: [P4] We should add a notice for people who want to use "styleSet" instead of "styleOptions".
//       "styleSet" is actually CSS stylesheet and it is based on the DOM tree.
//       DOM tree may change from time to time, thus, maintaining "styleSet" becomes a constant effort.

export default function createFullStyleSet(options: FullBundleStyleOptions) {
  return {
    ...createStyleSet(options),
    ...createAdaptiveCardsStyleSet(options)
  };
}
