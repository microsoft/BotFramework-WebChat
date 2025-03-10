import { hooks } from 'botframework-webchat-component';

import { StrictFullBundleStyleOptions } from '../types/FullBundleStyleOptions';

export default function useStyleOptions(): [StrictFullBundleStyleOptions] {
  const [styleOptions] = hooks.useStyleOptions();

  return [styleOptions as StrictFullBundleStyleOptions];
}
