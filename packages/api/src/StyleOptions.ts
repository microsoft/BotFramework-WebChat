import { DirectLineActivity } from 'botframework-webchat-core';

type StyleOptions = {
  /**
   * Basic styling
   */

  /** Web Chat component accent color */
  accent?: string;

  /**
   * Transcript background color
   */
  backgroundColor?: string;

  /**
   * Secondary component color
   */
  subtle?: string;

  /**
   * Default padding used in most visual components
   */
  paddingRegular?: number;

  /**
   * Padding used for suggestedAction buttons
   */
  paddingWide?: number;

  /**
  Transition for Bubble, Carousel, and StackedLayout
   */
  transitionDuration?: string;

  /**
   * Fonts
   * Default font size will be inherited from the host app
   */

  /**
   * Font size used for secondary components such as sendStatus
   */
  fontSizeSmall?: number | string;

  /**
   * Font used for ErrorBox
   * comma-space separated string
   */
  monospaceFont?: string;

  /**
   * Font used in most visual components
   * comma-space separated string
   */
  primaryFont?: string;

  rootHeight?: number | string;

  rootWidth?: number | string;

  /**
   * "z-index" for the root container of Web Chat. This will form a new stacking context so "z-index" used in children won't pollute.
   */
  rootZIndex?: number;

  /**
   * Avatar styling
   */

  /**
   * Border radius used for both bot and user avatar
   */
  avatarBorderRadius?: number | string;

  /**
   * Height and width of avatar
   */
  avatarSize?: number;

  /**
   * Background color defaults to accent
   */
  botAvatarBackgroundColor?: string;

  /**
   * URL string. Can be data URI or blob
   * botAvatarInitials must be set to empty string
   */
  botAvatarImage?: string;

  /**
   * Typically rendered as two letters, e.g. 'WC'
   * Empty string is required when setting botAvatarImage
   */
  botAvatarInitials?: string;

  /**
   * Background color defaults to accent
   */
  userAvatarBackgroundColor?: string;

  /**
   * URL string. Can be data URI or blob
   * userAvatarInitials must be set to empty string
   */
  userAvatarImage?: string;

  /**
   * Typically rendered as two letters, i.e. 'WC'
   * Empty string is required when setting userAvatarImage
   */
  userAvatarInitials?: string;

  /**
   * Avatar grouping can be set at 3 different levels:
   * Show avatar on activities sharing the same sender ('sender')
   * Show avatar on activities sharing the same status ('status'; default)
   * Show avatar on every activity (true)
   */
  showAvatarInGroup?: true | 'sender' | 'status';

  /**
   *  Bubble styling
   * 'Bubble' refers to the container of the activit(ies) from the bot and user. Below, non-'fromUser' props refer to styling for the bot activities.
   */

  bubbleBackground?: string;
  bubbleBorderColor?: string;
  bubbleBorderRadius?: number;
  bubbleBorderStyle?: string;
  bubbleBorderWidth?: number;
  bubbleFromUserBackground?: string;
  bubbleFromUserBorderColor?: string;
  bubbleFromUserBorderRadius?: number;
  bubbleFromUserBorderStyle?: string;
  bubbleFromUserBorderWidth?: number;

  /**
   * Nub offset 'bottom' will render nub at the bottom
   * A positive or negative number will shift nub offset up/down
   * "top" is equivalent to positive zero.
   * "bottom" is equivalent to negative zero.
   */
  bubbleFromUserNubOffset?: number | 'bottom' | 'top';

  /**
   * Nub size 0 will render a sharp corner
   */
  bubbleFromUserNubSize?: number;

  bubbleFromUserTextColor?: string;
  bubbleImageHeight?: number;
  bubbleMaxWidth?: number;
  bubbleMinHeight?: number;
  bubbleMinWidth?: number;

  /**
   * Nub offset ''bottom' will render nub at the bottom
   * A positive or negative number will shift nub offset up/down
   * "top" is equivalent to positive zero.
   * "bottom" is equivalent to negative zero.
   */
  bubbleNubOffset?: number | 'bottom' | 'top';

  /**
   * Nub size 0 will render a sharp corner
   */
  bubbleNubSize?: number;

  bubbleTextColor?: string;

  messageActivityWordBreak?: 'normal' | 'break-all' | 'break-word' | 'keep-all';

  /**
   * Connectivity UI styling
   */

  connectivityIconPadding?: number;
  connectivityMarginLeftRight?: number;
  connectivityMarginTopBottom?: number;
  connectivityTextSize?: number | string;
  failedConnectivity?: number | string;
  slowConnectivity?: string;
  notificationText?: string;

  /**
   * Slow connection status will render after x amount of time with no service response
   */
  slowConnectionAfter?: number;

  /**
   * Emoji styling
   * If true, Web Chat's default set of emoji will be enabled. See patchStyleOptions.js for default list.
   * A custom object will enable unicode emoji specified by the developer.
   * key: emoticon
   * value: unicode emoji
   */
  emojiSet?: boolean | Record<string, string>;

  /**
   * Live region - Accessibility
   * New activities will be rendered in the non-visual live region and removed after a certain amount of time. Modify this property to change fade time.
   */
  internalLiveRegionFadeAfter?: number;

  /**
   * Markdown styling
   * Parse markdown to ensure carriage return is respected
   */
  markdownRespectCRLF?: boolean;

  /**
   * Assign new image for anchor links to indicate external
   */

  markdownExternalLinkIconImage?: string;
  /**
   * Scroll behavior styling
   */

  /**
   * Prevent scroll to end button from rendering
   *
   * @deprecated Since 4.14.0: To hide the scroll to end button, please set `scrollToEndButtonBehavior` to `false`.
   */
  // TODO: [P4] Will be removed on or after 2023-06-02.
  hideScrollToEndButton?: boolean;

  /**
   * Snap to activity to 'snap-point'
   * If true, scrolling will pause after 1 activity is received.
   * Specifying a number will pause after X number of activities
   */
  autoScrollSnapOnActivity?: boolean | number;

  /**
   * Specify number of pixels to overscroll or underscroll after pause
   */
  autoScrollSnapOnActivityOffset?: number;

  /**
   * If true, scrolling will pause after activities have filled the page.
   * Specifying a number (0 to 1) will pause after % of page is filled
   */
  autoScrollSnapOnPage?: boolean | number;

  /**
   * Specify number of pixels to overscroll or underscroll after pause
   */
  autoScrollSnapOnPageOffset?: number;

  /**
   * Send box styling
   */

  hideSendBox?: boolean;
  hideUploadButton?: boolean;
  microphoneButtonColorOnDictate?: string;
  sendBoxBackground?: string;

  /** Send box button: Icon color, defaults to subtle */
  sendBoxButtonColor?: string;

  /**
   * Send box button: Shade border radius
   *
   * @default 2
   */
  sendBoxButtonShadeBorderRadius?: number;

  /** Send box button: Shade color */
  sendBoxButtonShadeColor?: string;

  /**
   * Send box button: Shade inset
   *
   * @default 2
   */
  sendBoxButtonShadeInset?: number;

  /** Send box button (while `:active`): Icon color */
  sendBoxButtonColorOnActive?: string;

  /**
   * Send box button (while `:active`): Shade color
   *
   * @default '#EDEBE9'
   */
  sendBoxButtonShadeColorOnActive?: string;

  /** Send box button (while `:disabled`): Icon color */
  sendBoxButtonColorOnDisabled?: string;

  /**
   * Send box button (while `:disabled`): Shade color
   *
   * @default '#F3F2F1'
   */
  sendBoxButtonShadeColorOnDisabled?: string;

  /** Send box button (while `:focus`): Icon color */
  sendBoxButtonColorOnFocus?: string;

  /** Send box button (while `:focus`): Shade color */
  sendBoxButtonShadeColorOnFocus?: string;

  /** Send box button (while `:hover`): Icon color */
  sendBoxButtonColorOnHover?: string;

  /**
   * Send box button (while `:hover`): Shade color
   *
   * @default '#F3F2F1'
   */
  sendBoxButtonShadeColorOnHover?: string;

  /**
   * Send box button (while `:focus-visible`): Border color
   *
   * @default '#605E5C'
   */
  sendBoxButtonFocusVisibleBorderColor?: string;

  /**
   * Send box button (while `:focus-visible`): Inset
   *
   * @default 4
   */
  sendBoxButtonFocusVisibleInset?: number;

  /**
   * Send box button (while `:focus-visible`): Border radius
   *
   * @default 0
   */
  sendBoxButtonFocusVisibleBorderRadius?: number | string;

  /**
   * Send box button (while `:focus-visible`): Border style
   *
   * @default 'solid'
   */
  sendBoxButtonFocusVisibleBorderStyle?: string;

  /**
   * Send box button (while` :focus-visible`): Border width
   *
   * @default 4
   */
  sendBoxButtonFocusVisibleBorderWidth?: number;

  /**
   * Disabled text color defaults to subtle
   */
  sendBoxDisabledTextColor?: string;

  sendBoxHeight?: number | string;
  sendBoxMaxHeight?: number | string;
  sendBoxTextColor?: string;
  sendBoxBorderBottom?: number | string;
  sendBoxBorderLeft?: number | string;
  sendBoxBorderRight?: number | string;
  sendBoxBorderTop?: number | string;
  sendBoxPlaceholderColor?: string;
  sendBoxTextWrap?: boolean;
  sendBoxButtonAlignment?: 'bottom' | 'stretch' | 'top';

  /**
   * Show spoken text
   */
  showSpokenText?: boolean;

  /**
   * Spinner animation styling
   */

  spinnerAnimationBackgroundImage?: string;
  spinnerAnimationHeight?: number | string;
  spinnerAnimationWidth?: number | string;
  spinnerAnimationPadding?: number | string;

  /**
   * Suggested Actions
   */

  /** Suggested action: border radius */
  suggestedActionBorderRadius?: number | string;

  /**
   * Suggested action: background
   *
   * @default 'White'
   */
  suggestedActionBackground?: string;

  /** Suggested action: foreground color, defaults to accent color */
  suggestedActionTextColor?: string;

  /** Suggested action: border color, defaults to accent color */
  suggestedActionBorderColor?: string;

  /** Suggested action: border style */
  suggestedActionBorderStyle?: string;

  /** Suggested action: border width */
  suggestedActionBorderWidth?: number | string;

  /** Suggested action (while `:disabled`): background, defaults to suggestedActionBackground */
  suggestedActionDisabledBackground?: string;

  /** Suggested action (while `:disabled`): border color */
  suggestedActionDisabledBorderColor?: string;

  /** Suggested action (while `:disabled`): border style */
  suggestedActionDisabledBorderStyle?: string;

  /** Suggested action (while `:disabled`): border width */
  suggestedActionDisabledBorderWidth?: number | string;

  /** Suggested action (while `:disabled`): foreground color, defaults to subtle color */
  suggestedActionDisabledTextColor?: string;

  /** Suggested action: height */
  suggestedActionHeight?: number | string;

  /** Suggested action: image height */
  suggestedActionImageHeight?: number | string;

  /** Suggested action: layout type */
  suggestedActionLayout?: 'carousel' | 'flow' | 'stacked';

  /**
   * Suggested action (while `:focus-visible`): inset
   *
   * @default 2
   */
  suggestedActionFocusVisibleInset?: number;

  /**
   * Suggested action (while `:focus-visible`): border color
   *
   * @default '#605E5C'
   */
  suggestedActionFocusVisibleBorderColor?: string;

  /**
   * Suggested action (while `:focus-visible`): border style
   *
   * @default 'solid'
   */
  suggestedActionFocusVisibleBorderStyle?: string;

  /**
   * Suggested action (while `:focus-visible`): border width
   *
   * @default 1
   */
  suggestedActionFocusVisibleBorderWidth?: number;

  /**
   * Suggested action (while `:focus`): background
   */
  suggestedActionFocusBackground?: string;

  /**
   * Suggested action (while `:active`): background
   *
   * @default '#EDEBE9'
   */
  suggestedActionActiveBackground?: string;

  /**
   * Suggested action (while `:hover`): background
   *
   * @default '#F3F2F1'
   */
  suggestedActionHoverBackground?: string;

  /**
   * Suggested actions carousel layout
   */

  /**
   * Cursor when mouseover on flipper
   */
  suggestedActionsCarouselFlipperCursor?: string;

  /**
   * Flipper bounding box size
   */
  suggestedActionsCarouselFlipperBoxWidth?: number;

  /**
   * Flipper button's visible size
   */
  suggestedActionsCarouselFlipperSize?: number;

  /**
   * Suggested actions flow layout
   * Default value is 'auto',
   */
  suggestedActionsFlowMaxHeight?: undefined;

  /**
   * Suggested actions stacked layout
   */

  /**
   * Stacked height container's max height. Default value is 'auto'
   */
  suggestedActionsStackedHeight?: number | 'auto';

  /**
   * Stacked overflow default value is 'auto
   */
  suggestedActionsStackedOverflow?: 'string';

  /**
   * Button max height default value is 100% if suggestedActionsStackedLayoutButtonTextWrap is true
   */
  suggestedActionsStackedLayoutButtonMaxHeight?: number | string;

  /**
   * Button Text Wrap, if set to true, will wrap long text in buttons in STACKED mode ONLY
   */
  suggestedActionsStackedLayoutButtonTextWrap?: boolean;

  /**
   * Timestamp
   */

  /**
   * Specifies the time window for grouping related timestamps.
   *
   * `number` - time window for grouping related timestamps (in milliseconds)
   * `false` - never group timestamps
   * `true` - group all timestamps
   */
  groupTimestamp?: boolean | number;

  sendTimeout?: number | ((activity: DirectLineActivity) => number);
  sendTimeoutForAttachments?: number;

  /**
   * Timestamp color default value is subtle
   */
  timestampColor?: string;

  timestampFormat?: 'absolute' | 'relative';

  /**
   * Transcript styling
   */

  transcriptTerminatorBackgroundColor?: string;
  transcriptTerminatorBorderRadius?: number | string;
  transcriptTerminatorColor?: string;
  transcriptTerminatorFontSize?: number | string;

  transcriptActivityVisualKeyboardIndicatorColor?: string;
  transcriptActivityVisualKeyboardIndicatorStyle?: string;
  transcriptActivityVisualKeyboardIndicatorWidth?: number | string;

  transcriptVisualKeyboardIndicatorColor?: string;
  transcriptVisualKeyboardIndicatorStyle?: string;
  transcriptVisualKeyboardIndicatorWidth?: number | string;

  /**
   * Transcript overlay button
   * e.g. carousel and suggested action flippers, scroll to bottom, etc.
   */

  /**
   * Controls when the new messages button should show.
   *
   * - `"unread"` will show when there are any unread and offscreen messages (default)
   * - `"any"` will show when there are any offscreen messages
   * - `false` will always hide the button
   */
  scrollToEndButtonBehavior?: false | 'any' | 'unread';

  /** Font size of the new message button. */
  scrollToEndButtonFontSize?: number | string;

  /**
   * Font size of the new message button.
   *
   * @deprecated Since 4.14.0: Renamed to {@linkcode scrollToEndButtonFontSize}.
   */
  // TODO: [P4] Will be removed on or after 2023-06-02.
  newMessagesButtonFontSize?: number | string;

  transcriptOverlayButtonBackground?: string;
  transcriptOverlayButtonBackgroundOnDisabled?: string;
  transcriptOverlayButtonBackgroundOnFocus?: string;
  transcriptOverlayButtonBackgroundOnHover?: string;
  transcriptOverlayButtonColor?: string;
  transcriptOverlayButtonColorOnDisabled?: string;

  /**
   * Default value is transcriptOverlayButtonColor
   */
  transcriptOverlayButtonColorOnFocus?: string;

  /**
   * Default value is transcriptOverlayButtonColor
   */
  transcriptOverlayButtonColorOnHover?: string;

  /**
   * Toast UI
   */

  /**
   * New debounce timeout value only affects new notifications.
   */
  notificationDebounceTimeout?: number;

  hideToaster?: boolean;
  toasterHeight?: number | string;
  toasterMaxHeight?: number | string;
  toasterSingularMaxHeight?: number | string;
  toastFontSize?: number | string;
  toastIconWidth?: number | string;
  toastSeparatorColor?: string;
  toastTextPadding?: number | string;

  toastErrorBackgroundColor?: string;
  toastErrorColor?: string;
  toastInfoBackgroundColor?: string;
  toastInfoColor?: string;
  toastSuccessBackgroundColor?: string;
  toastSuccessColor?: string;
  toastWarnBackgroundColor?: string;
  toastWarnColor?: string;

  /**
   * Typing animation
   */

  typingAnimationBackgroundImage?: string;
  typingAnimationDuration?: number;
  typingAnimationHeight?: number | string;
  typingAnimationWidth?: number | string;

  /**
   * Upload thumbnail
   */

  enableUploadThumbnail?: boolean;
  uploadThumbnailContentType?: string;
  uploadThumbnailHeight?: number | string;
  uploadThumbnailQuality?: number;
  uploadThumbnailWidth?: number | string;

  /**
   * Video
   */

  videoHeight?: number | string;
};

// StrictStyleOptions is only used internally in Web Chat and for simplifying our code:
// 1. Allow developers to set the "bubbleNubOffset" option as "top" (string), but when we normalize them, we will convert it to 0 (number);
// 2. Renamed/deprecated options, only the newer option will be kept, the older option will be dropped.
//    Internally, no code should use the deprecated value except the migration code.
type StrictStyleOptions = Required<Omit<StyleOptions, 'hideScrollToEndButton' | 'newMessagesButtonFontSize'>> & {
  bubbleFromUserNubOffset: number;
  bubbleNubOffset: number;
  emojiSet: false | Record<string, string>;
};

export default StyleOptions;
export { StrictStyleOptions };
