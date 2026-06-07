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

  /**
   * Cards: Rich Cards
   *
   * When `true` (default, preserves historical behavior), the title of cards that flow through
   * `AdaptiveCardBuilder.addCommonHeaders` (hero, OAuth, animation/audio/video cards via
   * `CommonCard`, and thumbnail cards without images) is rendered with Adaptive Cards
   * `style: 'heading'`, which the Adaptive Cards SDK exposes via `role="heading"` + `aria-level`.
   *
   * Set to `false` when these card titles are not navigational headings in your host page
   * (e.g. when card titles appear inside a chat transcript and would create misleading
   * heading structure for assistive technology).
   *
   * @see https://github.com/microsoft/BotFramework-WebChat/issues/4327 - original request to add the heading
   */
  richCardTitleAsHeading: boolean | undefined;
};

type AdaptiveCardsStyleOptions = Partial<StrictAdaptiveCardsStyleOptions>;

export type { AdaptiveCardsStyleOptions, StrictAdaptiveCardsStyleOptions };
