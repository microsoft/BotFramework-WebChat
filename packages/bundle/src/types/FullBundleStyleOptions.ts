import { type StrictStyleOptions, type StyleOptions } from 'botframework-webchat-api';

import {
  type AdaptiveCardsStyleOptions,
  type StrictAdaptiveCardsStyleOptions
} from '../adaptiveCards/AdaptiveCardsStyleOptions';

type FullBundleStyleOptions = StyleOptions & AdaptiveCardsStyleOptions;
type StrictFullBundleStyleOptions = StrictStyleOptions & StrictAdaptiveCardsStyleOptions;

export default FullBundleStyleOptions;
export { StrictFullBundleStyleOptions };
