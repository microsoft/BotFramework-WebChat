import type { WebChatActivity } from 'botframework-webchat-core';

type StyleOptions = {
  /**
   * Basic styling
   */

  /** Web Chat component accent color */
  accent?: string | undefined;

  /**
   * Transcript background color
   */
  backgroundColor?: string | undefined;

  /**
   * Secondary component color
   */
  subtle?: string | undefined;

  /**
   * Default padding used in most visual components
   */
  paddingRegular?: number | undefined;

  /**
   * Padding used for suggestedAction buttons
   */
  paddingWide?: number | undefined;

  /**
   * The duration to be used for transitions
   */
  transitionDuration?: string | undefined;

  /**
   * The easing function to be used for transitions
   */
  transitionEasing?: string | undefined;

  /**
   * Fonts
   * Default font size will be inherited from the host app
   */

  /**
   * Font size used for secondary components such as sendStatus
   */
  fontSizeSmall?: number | string | undefined;

  /**
   * Font used for ErrorBox
   * comma-space separated string
   */
  monospaceFont?: string | undefined;

  /**
   * Font used in most visual components
   * comma-space separated string
   */
  primaryFont?: string | undefined;

  rootHeight?: number | string | undefined;

  rootWidth?: number | string | undefined;

  /**
   * "z-index" for the root container of Web Chat. This will form a new stacking context so "z-index" used in children won't pollute.
   */
  rootZIndex?: number | undefined;

  /**
   * Avatar styling
   */

  /**
   * Border radius used for both bot and user avatar
   */
  avatarBorderRadius?: number | string | undefined;

  /**
   * Height and width of avatar
   */
  avatarSize?: number | undefined;

  /**
   * Background color defaults to accent
   */
  botAvatarBackgroundColor?: string | undefined;

  /**
   * URL string. Can be data URI or blob
   * botAvatarInitials must be set to empty string
   */
  botAvatarImage?: string | undefined;

  /**
   * Typically rendered as two letters, e.g. 'WC'
   * Empty string is required when setting botAvatarImage
   */
  botAvatarInitials?: string | undefined;

  /**
   * Background color defaults to accent
   */
  userAvatarBackgroundColor?: string | undefined;

  /**
   * URL string. Can be data URI or blob
   * userAvatarInitials must be set to empty string
   */
  userAvatarImage?: string | undefined;

  /**
   * Typically rendered as two letters, i.e. 'WC'
   * Empty string is required when setting userAvatarImage
   */
  userAvatarInitials?: string | undefined;

  /**
   * Avatar grouping can be set at 3 different levels:
   * Show avatar on activities sharing the same sender ('sender')
   * Show avatar on activities sharing the same status ('status'; default)
   * Show avatar on every activity (true)
   */
  showAvatarInGroup?: true | 'sender' | 'status' | undefined;

  /**
   *  Bubble styling
   * 'Bubble' refers to the container of the activit(ies) from the bot and user. Below, non-'fromUser' props refer to styling for the bot activities.
   */

  bubbleBackground?: string | undefined;
  bubbleBorderColor?: string | undefined;
  bubbleBorderRadius?: number | undefined;
  bubbleBorderStyle?: string | undefined;
  bubbleBorderWidth?: number | undefined;
  bubbleFromUserBackground?: string | undefined;
  bubbleFromUserBorderColor?: string | undefined;
  bubbleFromUserBorderRadius?: number | undefined;
  bubbleFromUserBorderStyle?: string | undefined;
  bubbleFromUserBorderWidth?: number | undefined;

  /**
   * Nub offset 'bottom' will render nub at the bottom
   * A positive or negative number will shift nub offset up/down
   * "top" is equivalent to positive zero.
   * "bottom" is equivalent to negative zero.
   */
  bubbleFromUserNubOffset?: number | 'bottom' | 'top' | undefined;

  /**
   * Nub size 0 will render a sharp corner
   */
  bubbleFromUserNubSize?: number | undefined;

  bubbleFromUserTextColor?: string | undefined;

  /**
   * Specifies the fixed height of the bubble for image, default to unset.
   *
   * @deprecated Use `bubbleImageMaxHeight` and `bubbleImageMinHeight` instead. To mimick behavior before deprecation, set both options to 240px.
   */
  bubbleImageHeight?: number | undefined;

  /**
   * Specifies the maximum height of the bubble for image, default to 240px.
   *
   * CSS variable: `--webchat__max-height--image-bubble`.
   *
   * New in 4.18.0.
   */
  bubbleImageMaxHeight?: number | undefined;

  /**
   * Specifies the minimum height of the bubble for image, default to 240px.
   *
   * CSS variable: `--webchat__min-height--image-bubble`.
   *
   * New in 4.18.0.
   */
  bubbleImageMinHeight?: number | undefined;

  /* @deprecated Please use `bubbleAttachmentMaxWidth` and `bubbleMessageMaxWidth` instead. */
  bubbleMaxWidth?: number | undefined;
  /* @deprecated Please use `bubbleAttachmentMaxWidth` and `bubbleMessageMaxWidth` instead. */
  bubbleMinWidth?: number | undefined;

  bubbleAttachmentMaxWidth?: number | undefined;
  bubbleAttachmentMinWidth?: number | undefined;
  bubbleMessageMaxWidth?: number | undefined;
  bubbleMessageMinWidth?: number | undefined;

  bubbleMinHeight?: number | undefined;

  /**
   * Nub offset ''bottom' will render nub at the bottom
   * A positive or negative number will shift nub offset up/down
   * "top" is equivalent to positive zero.
   * "bottom" is equivalent to negative zero.
   */
  bubbleNubOffset?: number | 'bottom' | 'top' | undefined;

  /**
   * Nub size 0 will render a sharp corner
   */
  bubbleNubSize?: number | undefined;

  bubbleTextColor?: string | undefined;

  messageActivityWordBreak?: 'normal' | 'break-all' | 'break-word' | 'keep-all' | undefined;

  /**
   * Connectivity UI styling
   */

  connectivityIconPadding?: number | undefined;
  connectivityMarginLeftRight?: number | undefined;
  connectivityMarginTopBottom?: number | undefined;
  connectivityTextSize?: number | string | undefined;
  failedConnectivity?: number | string | undefined;
  slowConnectivity?: string | undefined;
  notificationText?: string | undefined;

  /**
   * Slow connection status will render after x amount of time with no service response
   */
  slowConnectionAfter?: number | undefined;

  /**
   * Emoji styling
   * If true, Web Chat's default set of emoji will be enabled. See patchStyleOptions.js for default list.
   * A custom object will enable unicode emoji specified by the developer.
   * key: emoticon
   * value: unicode emoji
   */
  emojiSet?: boolean | Record<string, string> | undefined;

  /**
   * Live region - Accessibility
   * New activities will be rendered in the non-visual live region and removed after a certain amount of time. Modify this property to change fade time.
   */
  internalLiveRegionFadeAfter?: number | undefined;

  /**
   * Markdown styling
   * Parse markdown to ensure carriage return is respected
   */
  markdownRespectCRLF?: boolean | undefined;

  /**
   * Render HTML inside Markdown.
   *
   * `true` to render HTML inside Markdown, otherwise, `false`. Defaults to `true`.
   *
   * New in 4.17: This option is enabled by default.
   */
  markdownRenderHTML?: boolean | undefined;

  /**
   * Assign new image for anchor links to indicate external
   */
  markdownExternalLinkIconImage?: string | undefined;

  /**
   * Scroll behavior styling
   */

  /**
   * Prevent scroll to end button from rendering
   *
   * @deprecated Since 4.14.0: To hide the scroll to end button, please set `scrollToEndButtonBehavior` to `false`.
   */
  // TODO: [P4] Will be removed on or after 2023-06-02.
  hideScrollToEndButton?: boolean | undefined;

  /**
   * Snap to activity to 'snap-point'
   * If true, scrolling will pause after 1 activity is received.
   * Specifying a number will pause after X number of activities
   */
  autoScrollSnapOnActivity?: boolean | number | undefined;

  /**
   * Specify number of pixels to overscroll or underscroll after pause
   */
  autoScrollSnapOnActivityOffset?: number | undefined;

  /**
   * If true, scrolling will pause after activities have filled the page.
   * Specifying a number (0 to 1) will pause after % of page is filled
   */
  autoScrollSnapOnPage?: boolean | number | undefined;

  /**
   * Specify number of pixels to overscroll or underscroll after pause
   */
  autoScrollSnapOnPageOffset?: number | undefined;

  /**
   * Send box styling
   */

  hideSendBox?: boolean | undefined;

  /**
   * Indicates if the upload file button should be hidden.
   *
   * @default false
   *
   * @deprecated deprecated since 4.18.0: obsolated by {@linkcode disableFileUpload}. This option will be removed on or after 2027-07-14.
   */
  hideUploadButton?: boolean | undefined;

  /**
   * (EXPERIMENTAL) `true`, if the telephone keypad button should be shown, otherwise, `false`. Defaults to `true`.
   *
   * @deprecated This is an experimental style options and should not be used without understanding its risk.
   */
  hideTelephoneKeypadButton?: boolean | undefined;

  microphoneButtonColorOnDictate?: string | undefined;
  sendBoxBackground?: string | undefined;

  /**
   * The comma-delimited file types that the upload button should accept.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
   * @example 'image/*,.pdf'
   */
  uploadAccept?: string | undefined;
  /**
   * If true, the upload button will accept multiple files.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#multiple
   */
  uploadMultiple?: boolean | undefined;

  /**
   * If set to `send` (default), attachment will be sent when the send button is clicked, or when the message is being sent.
   *
   * Otherwise, if set to `attach`, attachment will be sent immediately after file is selected.
   */
  sendAttachmentOn?: 'attach' | 'send' | undefined;

  /** Send box button: Icon color, defaults to subtle */
  sendBoxButtonColor?: string | undefined;

  /**
   * Send box button: Shade border radius
   *
   * @default 2
   */
  sendBoxButtonShadeBorderRadius?: number | undefined;

  /** Send box button: Shade color */
  sendBoxButtonShadeColor?: string | undefined;

  /**
   * Send box button: Shade inset
   *
   * @default 2
   */
  sendBoxButtonShadeInset?: number | undefined;

  /** Send box button (while `:active`): Icon color */
  sendBoxButtonColorOnActive?: string | undefined;

  /**
   * Send box button (while `:active`): Shade color
   *
   * @default '#EDEBE9'
   */
  sendBoxButtonShadeColorOnActive?: string | undefined;

  /**
   * Send box button (while `:disabled`): Icon color
   *
   * @default '#A19F9D'
   */
  sendBoxButtonColorOnDisabled?: string | undefined;

  /**
   * Send box button (while `:disabled`): Shade color
   *
   * @default '#F3F2F1'
   */
  sendBoxButtonShadeColorOnDisabled?: string | undefined;

  /** Send box button (while `:focus`): Icon color */
  sendBoxButtonColorOnFocus?: string | undefined;

  /** Send box button (while `:focus`): Shade color */
  sendBoxButtonShadeColorOnFocus?: string | undefined;

  /** Send box button (while `:hover`): Icon color */
  sendBoxButtonColorOnHover?: string | undefined;

  /**
   * Send box button (while `:hover`): Shade color
   *
   * @default '#F3F2F1'
   */
  sendBoxButtonShadeColorOnHover?: string | undefined;

  /**
   * Send box button (while `:focus-visible`): Keyboard focus indicator border color
   *
   * @default '#605E5C'
   */
  sendBoxButtonKeyboardFocusIndicatorBorderColor?: string | undefined;

  /**
   * Send box button (while `:focus-visible`): Keyboard focus indicator border radius
   *
   * @default 0
   */
  sendBoxButtonKeyboardFocusIndicatorBorderRadius?: number | string | undefined;

  /**
   * Send box button (while `:focus-visible`): Keyboard focus indicator border style
   *
   * @default 'solid'
   */
  sendBoxButtonKeyboardFocusIndicatorBorderStyle?: string | undefined;

  /**
   * Send box button (while` :focus-visible`): Keyboard focus indicator border width
   *
   * @default 4
   */
  sendBoxButtonKeyboardFocusIndicatorBorderWidth?: number | undefined;

  /**
   * Send box button (while `:focus-visible`): Keyboard focus indicator inset
   *
   * @default 4
   */
  sendBoxButtonKeyboardFocusIndicatorInset?: number | undefined;

  /**
   * Disabled text color defaults to subtle
   */
  sendBoxDisabledTextColor?: string | undefined;

  sendBoxHeight?: number | string | undefined;
  sendBoxMaxHeight?: number | string | undefined;
  sendBoxTextColor?: string | undefined;
  sendBoxBorderBottom?: number | string | undefined;
  sendBoxBorderLeft?: number | string | undefined;
  sendBoxBorderRight?: number | string | undefined;
  sendBoxBorderTop?: number | string | undefined;
  sendBoxPlaceholderColor?: string | undefined;
  sendBoxTextWrap?: boolean | undefined;
  sendBoxButtonAlignment?: 'bottom' | 'stretch' | 'top' | undefined;

  /**
   * Show spoken text
   */
  showSpokenText?: boolean | undefined;

  /**
   * Spinner animation styling
   */

  spinnerAnimationBackgroundImage?: string | undefined;
  spinnerAnimationHeight?: number | string | undefined;
  spinnerAnimationWidth?: number | string | undefined;
  spinnerAnimationPadding?: number | string | undefined;

  /**
   * Suggested Actions
   */

  /**
   * Suggested action: border radius
   *
   * @default 0
   */
  suggestedActionBorderRadius?: number | string | undefined;

  /**
   * Suggested action: Background
   *
   * @deprecated Since 4.15.0: Please use `suggestedActionBackgroundColor` instead. This option will be removed on or after 2023-09-16.
   */
  suggestedActionBackground?: string | undefined;

  /**
   * Suggested action: Background color
   *
   * @default 'White'
   */
  suggestedActionBackgroundColor?: string | undefined;

  /** Suggested action: Border color, defaults to accent color */
  suggestedActionBorderColor?: string | undefined;

  /**
   * Suggested action: Border style
   *
   * @default 'solid'
   */
  suggestedActionBorderStyle?: string | undefined;

  /**
   * Suggested action: Border width
   *
   * @default 2
   */
  suggestedActionBorderWidth?: number | undefined;

  /** Suggested action: Text color, defaults to accent color */
  suggestedActionTextColor?: string | undefined;

  /** Suggested action (while `:disabled`): Background color, defaults to suggestedActionBackground */
  suggestedActionBackgroundColorOnDisabled?: string | undefined;

  /**
   * Suggested action (while `:disabled`): Border color
   *
   * @default '#E6E6E6'
   */
  suggestedActionBorderColorOnDisabled?: string | undefined;

  /** Suggested action (while `:disabled`): Border style */
  suggestedActionBorderStyleOnDisabled?: string | undefined;

  /** Suggested action (while `:disabled`): Border width */
  suggestedActionBorderWidthOnDisabled?: number | undefined;

  /** Suggested action (while `:disabled`): Foreground color, defaults to subtle color */
  suggestedActionTextColorOnDisabled?: string | undefined;

  /**
   * Suggested action (while `:active`): Background color
   *
   * @default '#EDEBE9'
   */
  suggestedActionBackgroundColorOnActive?: string | undefined;

  /** Suggested action (while `:active`): Border color */
  suggestedActionBorderColorOnActive?: string | undefined;

  /** Suggested action (while `:active`): Border style */
  suggestedActionBorderStyleOnActive?: string | undefined;

  /** Suggested action (while `:active`): Border width */
  suggestedActionBorderWidthOnActive?: number | undefined;

  /** Suggested action (while `:active`): Text color */
  suggestedActionTextColorOnActive?: string | undefined;

  /** Suggested action (while `:focus`): Background color */
  suggestedActionBackgroundColorOnFocus?: string | undefined;

  /** Suggested action (while `:focus`): Border color */
  suggestedActionBorderColorOnFocus?: string | undefined;

  /** Suggested action (while `:focus`): Border style */
  suggestedActionBorderStyleOnFocus?: string | undefined;

  /** Suggested action (while `:focus`): Border width */
  suggestedActionBorderWidthOnFocus?: number | undefined;

  /** Suggested action (while `:focus`): Text color */
  suggestedActionTextColorOnFocus?: string | undefined;

  /**
   * Suggested action (while `:hover`): Background color
   *
   * @default '#F3F2F1'
   */
  suggestedActionBackgroundColorOnHover?: string | undefined;

  /** Suggested action (while `:hover`): Border color */
  suggestedActionBorderColorOnHover?: string | undefined;

  /** Suggested action (while `:hover`): Border style */
  suggestedActionBorderStyleOnHover?: string | undefined;

  /** Suggested action (while `:hover`): Border width */
  suggestedActionBorderWidthOnHover?: number | undefined;

  /** Suggested action (while `:hover`): Text color */
  suggestedActionTextColorOnHover?: string | undefined;

  /**
   * Suggested action (while `:disabled`): Background, defaults to suggestedActionBackground.
   *
   * @deprecated Since 4.15.0: Please use `suggestedActionBackgroundColorOnDisabled` instead. This option will be removed on or after 2023-09-16.
   */
  suggestedActionDisabledBackground?: string | undefined;

  /**
   * Suggested action (while `:disabled`): Border color
   *
   * @deprecated Since 4.15.0: Please use `suggestedActionBorderColorOnDisabled` instead. This option will be removed on or after 2023-09-16.
   */
  suggestedActionDisabledBorderColor?: string | undefined;

  /**
   * Suggested action (while `:disabled`): Border style
   *
   * @deprecated Since 4.15.0: Please use `suggestedActionBorderStyleOnDisabled` instead. This option will be removed on or after 2023-09-16.
   */
  suggestedActionDisabledBorderStyle?: string | undefined;

  /**
   * Suggested action (while `:disabled`): Border width
   *
   * @deprecated Since 4.15.0: Please use `suggestedActionBorderWidthOnDisabled` instead. This option will be removed on or after 2023-09-16.
   */
  suggestedActionDisabledBorderWidth?: number | undefined;

  /**
   * Suggested action (while `:disabled`): Foreground color, defaults to subtle color
   *
   * @deprecated Since 4.15.0: Please use `suggestedActionTextColorOnDisabled` instead. This option will be removed on or after 2023-09-16.
   */
  suggestedActionDisabledTextColor?: string | undefined;

  /**
   * Suggested action: Height
   *
   * @default 40
   */
  suggestedActionHeight?: number | string | undefined;

  /**
   * Suggested action: Image height
   *
   * @default 20
   */
  suggestedActionImageHeight?: number | string | undefined;

  /**
   * Suggested action: Layout type
   *
   * @default 'carousel'
   */
  suggestedActionLayout?: 'carousel' | 'flow' | 'stacked' | undefined;

  /**
   * Suggested action (while `:focus-visible`): Keyboard focus indicator border color
   *
   * @default '#605E5C'
   */
  suggestedActionKeyboardFocusIndicatorBorderColor?: string | undefined;

  /**
   * Suggested action (while `:focus-visible`): Keyboard focus indicator border radius
   *
   * @default 0
   */
  suggestedActionKeyboardFocusIndicatorBorderRadius?: number | string | undefined;

  /**
   * Suggested action (while `:focus-visible`): Keyboard focus indicator border style
   *
   * @default 'solid'
   */
  suggestedActionKeyboardFocusIndicatorBorderStyle?: string | undefined;

  /**
   * Suggested action (while `:focus-visible`): Keyboard focus indicator border width
   *
   * @default 1
   */
  suggestedActionKeyboardFocusIndicatorBorderWidth?: number | undefined;

  /**
   * Suggested action (while `:focus-visible`): Keyboard focus indicator inset
   *
   * @default 2
   */
  suggestedActionKeyboardFocusIndicatorInset?: number | undefined;

  /**
   * Suggested action (while `:active`): background
   *
   * @deprecated Since 4.15.0: Please use `suggestedActionBackgroundColorOnActive` instead. This option will be removed on or after 2023-09-16.
   */
  suggestedActionActiveBackground?: string | undefined;

  /**
   * Suggested action (while `:focus`): background
   *
   * @deprecated Since 4.15.0: Please use `suggestedActionBackgroundColorOnFocus` instead. This option will be removed on or after 2023-09-16.
   */
  suggestedActionFocusBackground?: string | undefined;

  /**
   * Suggested action (while `:hover`): background
   *
   * @deprecated Since 4.15.0: Please use `suggestedActionBackgroundColorOnHover` instead. This option will be removed on or after 2023-09-16.
   */
  suggestedActionHoverBackground?: string | undefined;

  /**
   * Suggested actions carousel layout
   */

  /**
   * Cursor when mouseover on flipper
   */
  suggestedActionsCarouselFlipperCursor?: string | undefined;

  /**
   * Flipper bounding box size
   */
  suggestedActionsCarouselFlipperBoxWidth?: number | undefined;

  /**
   * Flipper button's visible size
   */
  suggestedActionsCarouselFlipperSize?: number | undefined;

  /**
   * Suggested actions flow layout
   * Default value is 'auto',
   */
  suggestedActionsFlowMaxHeight?: number | undefined;

  /**
   * Suggested actions stacked layout
   */

  /**
   * Stacked height container's max height. Default value is 'auto'
   */
  suggestedActionsStackedHeight?: number | 'auto' | undefined;

  /**
   * Stacked overflow default value is 'auto'
   */
  suggestedActionsStackedOverflow?: 'auto' | 'hidden' | 'scroll' | 'visible' | undefined;

  /**
   * Button max height default value is 100% if suggestedActionsStackedLayoutButtonTextWrap is true
   */
  suggestedActionsStackedLayoutButtonMaxHeight?: number | string | undefined;

  /**
   * Button Text Wrap, if set to true, will wrap long text in buttons in STACKED mode ONLY
   */
  suggestedActionsStackedLayoutButtonTextWrap?: boolean | undefined;

  /** Suggested actions: Visual keyboard indicator color for the container. */
  suggestedActionsVisualKeyboardIndicatorColor?: string | undefined;

  /** Suggested actions: Visual keyboard indicator style for the container. */
  suggestedActionsVisualKeyboardIndicatorStyle?: string | undefined;

  /** Suggested actions: Visual keyboard indicator width for the container. */
  suggestedActionsVisualKeyboardIndicatorWidth?: number | undefined;

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
  groupTimestamp?: boolean | number | undefined;

  sendTimeout?: number | ((activity: WebChatActivity) => number) | undefined;
  sendTimeoutForAttachments?: number | undefined;

  /**
   * Timestamp color default value is subtle
   */
  timestampColor?: string | undefined;

  timestampFormat?: 'absolute' | 'relative' | undefined;

  /**
   * Transcript styling
   */

  transcriptTerminatorBackgroundColor?: string | undefined;
  transcriptTerminatorBorderRadius?: number | string | undefined;
  transcriptTerminatorColor?: string | undefined;
  transcriptTerminatorFontSize?: number | string | undefined;

  transcriptActivityVisualKeyboardIndicatorColor?: string | undefined;
  transcriptActivityVisualKeyboardIndicatorStyle?: string | undefined;
  transcriptActivityVisualKeyboardIndicatorWidth?: number | string | undefined;

  transcriptVisualKeyboardIndicatorColor?: string | undefined;
  transcriptVisualKeyboardIndicatorStyle?: string | undefined;
  transcriptVisualKeyboardIndicatorWidth?: number | string | undefined;

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
  scrollToEndButtonBehavior?: false | 'any' | 'unread' | undefined;

  /** Font size of the new message button. */
  scrollToEndButtonFontSize?: number | string | undefined;

  /**
   * Font size of the new message button.
   *
   * @deprecated Since 4.14.0: Renamed to {@linkcode scrollToEndButtonFontSize}.
   */
  // TODO: [P4] Will be removed on or after 2023-06-02.
  newMessagesButtonFontSize?: number | string | undefined;

  transcriptOverlayButtonBackground?: string | undefined;
  transcriptOverlayButtonBackgroundOnDisabled?: string | undefined;
  transcriptOverlayButtonBackgroundOnFocus?: string | undefined;
  transcriptOverlayButtonBackgroundOnHover?: string | undefined;
  transcriptOverlayButtonColor?: string | undefined;
  transcriptOverlayButtonColorOnDisabled?: string | undefined;

  /**
   * Default value is transcriptOverlayButtonColor
   */
  transcriptOverlayButtonColorOnFocus?: string | undefined;

  /**
   * Default value is transcriptOverlayButtonColor
   */
  transcriptOverlayButtonColorOnHover?: string | undefined;

  /**
   * Toast UI
   */

  /**
   * New debounce timeout value only affects new notifications.
   */
  notificationDebounceTimeout?: number | undefined;

  hideToaster?: boolean | undefined;
  toasterHeight?: number | string | undefined;
  toasterMaxHeight?: number | string | undefined;
  toasterSingularMaxHeight?: number | string | undefined;
  toastFontSize?: number | string | undefined;
  toastIconWidth?: number | string | undefined;
  toastSeparatorColor?: string | undefined;
  toastTextPadding?: number | string | undefined;

  toastErrorBackgroundColor?: string | undefined;
  toastErrorColor?: string | undefined;
  toastInfoBackgroundColor?: string | undefined;
  toastInfoColor?: string | undefined;
  toastSuccessBackgroundColor?: string | undefined;
  toastSuccessColor?: string | undefined;
  toastWarnBackgroundColor?: string | undefined;
  toastWarnColor?: string | undefined;

  /**
   * Typing animation
   */

  typingAnimationBackgroundImage?: string | undefined;
  typingAnimationDuration?: number | undefined;
  typingAnimationHeight?: number | string | undefined;
  typingAnimationWidth?: number | string | undefined;

  /**
   * Upload thumbnail
   */

  enableUploadThumbnail?: boolean | undefined;
  uploadThumbnailContentType?: string | undefined;
  uploadThumbnailHeight?: number | undefined;
  uploadThumbnailQuality?: number | undefined;
  uploadThumbnailWidth?: number | undefined;

  /**
   * Video
   */

  videoHeight?: number | string | undefined;

  /**
   * Maximum message length in characters
   *
   * @default 2000
   */
  maxMessageLength?: number | undefined;

  /**
   * The node to place Web Chat styles into. Needed when using as a Web Component.
   *
   * @default document.head
   */
  stylesRoot?: Node | undefined;

  /**
   * Border animation
   */

  /**
   * Border animation 1st color
   *
   * CSS variable: `--webchat__animation--border-color-1` CSS variable to adjust the color
   *
   * New in 4.19.0.
   */
  borderAnimationColor1?: string | undefined;
  /**
   * Border animation 2nd color
   *
   * CSS variable: `--webchat__animation--border-color-2` CSS variable to adjust the color
   *
   * New in 4.19.0.
   */
  borderAnimationColor2?: string | undefined;
  /**
   * Border animation 3rd color
   *
   * CSS variable: `--webchat__animation--border-color-3` CSS variable to adjust the color
   *
   * New in 4.19.0.
   */
  borderAnimationColor3?: string | undefined;

  /**
   * Code block theme
   *
   * - `'github-light-default'` - use light theme for code blocks
   * - `'github-dark-default'` - use dark theme for code blocks
   *
   * @default 'github-light-default'
   *
   * New in 4.19.0.
   */
  codeBlockTheme?: 'github-light-default' | 'github-dark-default' | undefined;

  /**
   * (EXPERIMENTAL) Feedback buttons placement
   *
   * - `'activity-actions'` - place feedback buttons inside activity actions - will show feedback form
   * - `'activity-status'` - place feedback buttons inside activity status
   *
   * @default 'activity-status'
   *
   * @deprecated This is an experimental style options and should not be used without understanding its risk.
   *
   * New in 4.19.0.
   */
  feedbackActionsPlacement?: 'activity-actions' | 'activity-status' | undefined;

  /**
   * Use continuous mode for speech recognition. Default to `false`.
   *
   * - `true` to use continuous mode which focuses on a hands-off experience, keeping speech recognition active for extended periods, supporting barge-in, non-speech interactions will not stop speech recognition
   * - `false` to use interactive mode which focuses on privacy, keeping speech recognition active only for the minimal time required, no barge-in, non-speech interactions will stop speech recognition
   *
   * @see https://github.com/microsoft/BotFramework-WebChat/pull/5426
   */
  speechRecognitionContinuous?: boolean | undefined;

  /**
   * Whether part groups are open by default.
   *
   * @default true
   */
  partGroupDefaultOpen?: boolean | undefined;

  /**
   * Whether references (citation link definitions) are open by default.
   *
   * @default true
   */
  referenceListDefaultOpen?: boolean | undefined;

  /**
   * Defines how activities are being grouped by (in the order of appearance in the array). Default to `['sender', 'status', 'part']` or `sender,status` in CSS.
   *
   * Values are key of result of `groupActivitiesMiddleware`. The default implementation of `groupActivitiesMiddleware` has `sender`, `status`, and `part`.
   *
   * To add new groupings, configure `groupActivitiesMiddleware` to output extra groups. Then, add the group names to `styleOptions.groupActivitiesBy`.
   */
  groupActivitiesBy?: readonly string[] | undefined;

  /**
   * Send box: maximum number of attachment item to preview as thumbnail before showing as text-only.
   * Send box: maximum height of the attachment bar.
   *
   * @default 114
   */
  sendBoxAttachmentBarMaxHeight?: number | undefined;

  /**
   * Send box: maximum number of attachment item to preview as thumbnail before showing as list item.
   *
   * @default 3
   */
  sendBoxAttachmentBarMaxThumbnail?: number | undefined;

  /**
   * Indicates if file upload should be disabled.
   *
   * @default false
   *
   * New in 4.19.0.
   */
  disableFileUpload?: boolean | undefined;
  /**
   * Controls microphone button visibility in Fluent theme send box.
   *
   * - `'auto'` - Show microphone button if the chat adapter supports voice (has voiceConfiguration capability)
   * - `'hide'` - Do not show microphone button regardless of adapter capabilities
   *
   * @default 'auto'
   */
  showMicrophoneButton?: 'auto' | 'hide' | undefined;
};

// StrictStyleOptions is only used internally in Web Chat and for simplifying our code:
// 1. Allow developers to set the "bubbleNubOffset" option as "top" (string), but when we normalize them, we will convert it to 0 (number);
// 2. Renamed/deprecated options, only the newer option will be kept, the older option will be dropped.
//    Internally, no code should use the deprecated value except the migration code.
type StrictStyleOptions = Required<
  Omit<
    StyleOptions,
    | 'bubbleImageHeight'
    | 'bubbleMaxWidth'
    | 'bubbleMinWidth'
    | 'hideScrollToEndButton'
    | 'hideUploadButton'
    | 'newMessagesButtonFontSize'
  >
> & {
  bubbleFromUserNubOffset: number;
  bubbleNubOffset: number;
  emojiSet: false | Record<string, string>;
};

export default StyleOptions;
export { StrictStyleOptions };
