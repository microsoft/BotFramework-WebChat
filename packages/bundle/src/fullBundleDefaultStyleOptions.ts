import { defaultStyleOptions } from 'botframework-webchat-api';
import adaptiveCardsDefaultStyleOptions from './adaptiveCards/defaultStyleOptions';

import { type StrictFullBundleStyleOptions } from './types/FullBundleStyleOptions';

const fullBundleDefaultStyleOptions: StrictFullBundleStyleOptions = {
  ...defaultStyleOptions,
  ...adaptiveCardsDefaultStyleOptions
};

export default fullBundleDefaultStyleOptions;
