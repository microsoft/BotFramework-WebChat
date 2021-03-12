import { defaultStyleOptions as defaultMinimalStyleOptions } from 'botframework-webchat-api';

import FullBundleStyleOptions from './FullBundleStyleOptions';

const FULL_BUNDLE_DEFAULT_STYLE_OPTIONS: FullBundleStyleOptions = {
  ...defaultMinimalStyleOptions,

  // Cards
  cardEmphasisBackgroundColor: '#F0F0F0',
  cardPushButtonBackgroundColor: '#0063B1',
  cardPushButtonTextColor: 'White',
  richCardWrapTitle: false
};

export default FULL_BUNDLE_DEFAULT_STYLE_OPTIONS;
