import { StrictStyleOptions } from 'botframework-webchat-api';

/**
 * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
 * The live styles are in `packages/component/src/Middleware/TypingIndicator/TypingIndicator.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
export default function createTypingIndicatorStyle({ paddingRegular }: StrictStyleOptions) {
  return {
    paddingBottom: paddingRegular,

    '&:not(.webchat__typing-indicator--rtl)': {
      paddingLeft: paddingRegular
    },

    '&.webchat__typing-indicator--rtl': {
      paddingRight: paddingRegular
    }
  };
}
