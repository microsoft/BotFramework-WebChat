import { defaultStyleOptions } from 'botframework-webchat-api';
import adaptiveCardsDefaultStyleOptions from './adaptiveCards/defaultStyleOptions';

import FullBundleStyleOptions from './types/FullBundleStyleOptions';

const fullBundleDefaultStyleOptions: Required<FullBundleStyleOptions> = {
  ...defaultStyleOptions,
  ...adaptiveCardsDefaultStyleOptions
};

export default fullBundleDefaultStyleOptions;
