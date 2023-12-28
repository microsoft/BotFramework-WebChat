import { type StrictStyleOptions, type StyleOptions } from 'botframework-webchat-api';

import { type StrictAdaptiveCardsStyleOptions } from '../adaptiveCards/AdaptiveCardsStyleOptions';
import type AdaptiveCardStyleOptions from '../adaptiveCards/AdaptiveCardsStyleOptions';

type FullBundleStyleOptions = StyleOptions & AdaptiveCardStyleOptions;
type StrictFullBundleStyleOptions = StrictStyleOptions & StrictAdaptiveCardsStyleOptions;

export default FullBundleStyleOptions;
export { StrictFullBundleStyleOptions };
