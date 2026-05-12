/**
 * Adaptive Cards styling
 */
type StrictAdaptiveCardsStyleOptions = {
  /** Adaptive Cards: Specify the maximum schema version supported by the Adaptive Card serializer. */
  adaptiveCardsParserMaxVersion: string | undefined;

  /**
   * Adaptive Cards styling for 'emphasis' container style
   */
  cardEmphasisBackgroundColor: string | undefined;

  /**
   * Adaptive Cards: background color of Adaptive Cards button with status of 'aria-pressed'
   */
  cardPushButtonBackgroundColor: string | undefined;

  /**
   * Adaptive Cards: text color of Adaptive Cards button with status of 'aria-pressed'
   */
  cardPushButtonTextColor: string | undefined;

  /**
   * Cards: Rich Cards
   * Enable title (and subtitle) wrapping
   */
  richCardWrapTitle: boolean | undefined;
};

type AdaptiveCardsStyleOptions = Partial<StrictAdaptiveCardsStyleOptions>;

export type { AdaptiveCardsStyleOptions, StrictAdaptiveCardsStyleOptions };
