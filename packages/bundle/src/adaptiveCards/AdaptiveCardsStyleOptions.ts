/**
 * Adaptive Cards styling
 */
type AdaptiveCardsStyleOptions = {
  /** Adaptive Cards: Specify the maximum schema version supported by the Adaptive Card serializer. */
  adaptiveCardsParserMaxVersion?: string;

  /**
   * Adaptive Cards styling for 'emphasis' container style
   */
  cardEmphasisBackgroundColor?: string;

  /**
   * Adaptive Cards: background color of Adaptive Cards button with status of 'aria-pressed'
   */
  cardPushButtonBackgroundColor?: string;

  /**
   * Adaptive Cards: text color of Adaptive Cards button with status of 'aria-pressed'
   */
  cardPushButtonTextColor?: string;

  /**
   * Cards: Rich Cards
   * Enable title (and subtitle) wrapping
   */
  richCardWrapTitle?: boolean;
};

type StrictAdaptiveCardsStyleOptions = Required<AdaptiveCardsStyleOptions>;

export default AdaptiveCardsStyleOptions;
export { StrictAdaptiveCardsStyleOptions };
