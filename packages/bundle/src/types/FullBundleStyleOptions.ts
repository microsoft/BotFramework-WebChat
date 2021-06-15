import { StrictStyleOptions, StyleOptions } from 'botframework-webchat-api';

import AdaptiveCardStyleOptions, { StrictAdaptiveCardsStyleOptions } from '../adaptiveCards/AdaptiveCardsStyleOptions';

type FullBundleStyleOptions = StyleOptions & AdaptiveCardStyleOptions;
type StrictFullBundleStyleOptions = StrictStyleOptions & StrictAdaptiveCardsStyleOptions;

export default FullBundleStyleOptions;
export { StrictFullBundleStyleOptions };
