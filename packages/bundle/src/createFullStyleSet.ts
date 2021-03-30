import { createStyleSet } from 'botframework-webchat-component';
import { StyleOptions } from 'botframework-webchat-api';

import createAdaptiveCardsStyleSet from './adaptiveCards/Styles/createAdaptiveCardsStyleSet';

// TODO: [P4] We should add a notice for people who want to use "styleSet" instead of "styleOptions".
//       "styleSet" is actually CSS stylesheet and it is based on the DOM tree.
//       DOM tree may change from time to time, thus, maintaining "styleSet" becomes a constant effort.

export default function createFullStyleSet(options: StyleOptions) {
  return {
    ...createStyleSet(options),
    ...createAdaptiveCardsStyleSet(options)
  };
}
