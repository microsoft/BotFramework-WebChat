import { defaultStyleOptions } from 'botframework-webchat-api';
import adaptiveCardsDefaultStyleOptions from './adaptiveCards/defaultStyleOptions';

import FullBundleStyleOptions from './FullBundleStyleOptions';

const FULL_BUNDLE_DEFAULT_STYLE_OPTIONS: Required<FullBundleStyleOptions> = {
  ...defaultStyleOptions,
  ...adaptiveCardsDefaultStyleOptions
};

export default FULL_BUNDLE_DEFAULT_STYLE_OPTIONS;
