import { StrictStyleOptions } from 'botframework-webchat-api';

import getDefaultSpinnerAnimationImageURL from '../private/getDefaultSpinnerAnimationImageURL';

/**
 * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
 * The live styles are in `packages/component/src/ConnectivityStatus/ConnectivityStatus.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
export default function createSpinnerAnimationStyle({
  spinnerAnimationBackgroundImage,
  spinnerAnimationHeight,
  spinnerAnimationWidth,
  spinnerAnimationPadding
}: StrictStyleOptions) {
  const backgroundImage = spinnerAnimationBackgroundImage || `url('${getDefaultSpinnerAnimationImageURL()}')`;

  return {
    backgroundImage,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    height: spinnerAnimationHeight,
    width: spinnerAnimationWidth,

    ':not(.webchat__spinner--rtl)': {
      marginRight: spinnerAnimationPadding
    },
    '.webchat__spinner--rtl': {
      marginLeft: spinnerAnimationPadding
    }
  };
}
