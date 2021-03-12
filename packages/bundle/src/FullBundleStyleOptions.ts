import { StyleOptions as MinimalStyleOptions } from 'botframework-webchat-api';

export default interface FullBundleStyleOptions extends MinimalStyleOptions {
  /**
   * Cards styling
   */
  cardEmphasisBackgroundColor?: string;

  /**
   * Cards: Adaptive Card push button
   */

  cardPushButtonBackgroundColor?: string;
  cardPushButtonTextColor?: string;

  /**
   * Cards: Rich Cards
   * Enable title (and subtitle) wrapping
   */
  richCardWrapTitle?: boolean;
}
