import { StrictStyleOptions } from 'botframework-webchat-api';

/**
 * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
 * The live styles are in `packages/component/src/SendBox/SendBox.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
export default function createDictationInterimsStyle({ paddingRegular, primaryFont }: StrictStyleOptions) {
  return {
    fontFamily: primaryFont,
    margin: 0,
    paddingBottom: 0,
    paddingLeft: paddingRegular,
    paddingRight: paddingRegular,
    paddingTop: 0,

    '&.dictating > span:not(:first-child), &.status': {
      opacity: 0.5
    }
  };
}
