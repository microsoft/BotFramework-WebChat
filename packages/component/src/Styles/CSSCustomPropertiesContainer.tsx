import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { makeCreateStyles } from '@msinternal/botframework-webchat-styles';
import { InjectStyleElements } from '@msinternal/botframework-webchat-styles/react';
import { useStyleOptions } from 'botframework-webchat-api/hook';
import classNames from 'classnames';
import random from 'math-random';
import React, { forwardRef, memo, useMemo, type Ref } from 'react';
import { object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';
import CustomPropertyNames from './CustomPropertyNames';
import { StrictStyleOptions } from 'botframework-webchat-api';

const customPropertiesContainerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string()),
    // Intentionally undefinedable() instead of optional() to remind caller they should pass nonce.
    nonce: undefinedable(string())
  }),
  readonly()
);

type CustomPropertiesContainerProps = InferInput<typeof customPropertiesContainerPropsSchema>;

const webchatCustomPropertiesClass = 'webchat__css-custom-properties';

function uniqueId() {
  // eslint-disable-next-line no-magic-numbers
  return Math.ceil(random() * Number.MAX_SAFE_INTEGER).toString(36);
}

function hasBundleStyleOptions(styleOptions: StrictStyleOptions): styleOptions is StrictStyleOptions & {
  cardPushButtonBackgroundColor?: string;
  cardPushButtonTextColor?: string;
} {
  return 'cardPushButtonBackgroundColor' in styleOptions || 'cardPushButtonTextColor' in styleOptions;
}

function CustomPropertiesContainer(props: CustomPropertiesContainerProps, ref: Ref<HTMLDivElement>) {
  const { children, className, nonce } = validateProps(customPropertiesContainerPropsSchema, props);

  const [styleOptions] = useStyleOptions();

  const [styleElements, classNameState] = useMemo(() => {
    const {
      accent,
      avatarSize,
      borderAnimationColor1,
      borderAnimationColor2,
      borderAnimationColor3,
      bubbleAttachmentMaxWidth,
      bubbleAttachmentMinWidth,
      bubbleBackground,
      bubbleBorderColor,
      bubbleBorderRadius,
      bubbleBorderStyle,
      bubbleBorderWidth,
      bubbleFromUserBackground,
      bubbleFromUserBorderColor,
      bubbleFromUserBorderRadius,
      bubbleFromUserBorderStyle,
      bubbleFromUserBorderWidth,
      bubbleFromUserNubOffset,
      bubbleFromUserNubSize,
      bubbleFromUserTextColor,
      bubbleTextColor,
      bubbleImageMaxHeight,
      bubbleImageMinHeight,
      bubbleMessageMaxWidth,
      bubbleMessageMinWidth,
      bubbleMinHeight,
      bubbleNubOffset,
      bubbleNubSize,
      fontSizeSmall,
      markdownExternalLinkIconImage,
      messageActivityWordBreak,
      monospaceFont,
      paddingRegular,
      primaryFont,
      sendBoxAttachmentBarMaxHeight,
      subtle,
      timestampColor,
      transcriptActivityVisualKeyboardIndicatorColor,
      transcriptActivityVisualKeyboardIndicatorStyle,
      transcriptActivityVisualKeyboardIndicatorWidth,
      transcriptOverlayButtonBackground,
      transcriptOverlayButtonBackgroundOnDisabled,
      transcriptOverlayButtonBackgroundOnFocus,
      transcriptOverlayButtonBackgroundOnHover,
      transcriptOverlayButtonColor,
      transcriptOverlayButtonColorOnDisabled,
      transcriptOverlayButtonColorOnFocus,
      transcriptOverlayButtonColorOnHover,
      transcriptTerminatorBackgroundColor,
      transcriptTerminatorBorderRadius,
      transcriptTerminatorColor,
      transcriptTerminatorFontSize,
      transcriptVisualKeyboardIndicatorColor,
      transcriptVisualKeyboardIndicatorStyle,
      transcriptVisualKeyboardIndicatorWidth,
      transitionDuration,
      transitionEasing
    } = styleOptions;

    let bundleStyleProps = '';
    if (hasBundleStyleOptions(styleOptions)) {
      const { cardPushButtonBackgroundColor, cardPushButtonTextColor } = styleOptions;
      bundleStyleProps = `
  ${CustomPropertyNames.BackgroundCardPushButton}: ${cardPushButtonBackgroundColor};
  ${CustomPropertyNames.ColorCardPushButton}: ${cardPushButtonTextColor};
`;
    }

    const randomClass = `w${uniqueId()}_${webchatCustomPropertiesClass.replace('webchat__', '')}` as const;

    const contents = `
.${webchatCustomPropertiesClass}.${randomClass} {
  display: contents;
  /* From component */
  ${CustomPropertyNames.BackgroundBubble}: ${bubbleBackground};
  ${CustomPropertyNames.BackgroundBubbleUser}: ${bubbleFromUserBackground};
  ${CustomPropertyNames.BackgroundTranscriptOverlayButton}: ${transcriptOverlayButtonBackground};
  ${CustomPropertyNames.BackgroundTranscriptOverlayButtonDisabled}: ${transcriptOverlayButtonBackgroundOnDisabled};
  ${CustomPropertyNames.BackgroundTranscriptOverlayButtonFocus}: ${transcriptOverlayButtonBackgroundOnFocus};
  ${CustomPropertyNames.BackgroundTranscriptOverlayButtonHover}: ${transcriptOverlayButtonBackgroundOnHover};
  ${CustomPropertyNames.BackgroundTranscriptTerminator}: ${transcriptTerminatorBackgroundColor};
  ${CustomPropertyNames.BorderAnimationColor1}: ${borderAnimationColor1};
  ${CustomPropertyNames.BorderAnimationColor2}: ${borderAnimationColor2};
  ${CustomPropertyNames.BorderAnimationColor3}: ${borderAnimationColor3};
  ${CustomPropertyNames.BorderColorBubble}: ${bubbleBorderColor};
  ${CustomPropertyNames.BorderColorBubbleUser}: ${bubbleFromUserBorderColor};
  ${CustomPropertyNames.BorderRadiusBubble}: ${bubbleBorderRadius}px;
  ${CustomPropertyNames.BorderRadiusBubbleUser}: ${bubbleFromUserBorderRadius}px;
  ${CustomPropertyNames.BorderRadiusTranscriptTerminator}: ${transcriptTerminatorBorderRadius}px;
  ${CustomPropertyNames.BorderStyleBubble}: ${bubbleBorderStyle};
  ${CustomPropertyNames.BorderStyleBubbleUser}: ${bubbleFromUserBorderStyle};
  ${CustomPropertyNames.BorderStyleTranscriptActivityVisualKeyboardIndicator}: ${transcriptActivityVisualKeyboardIndicatorStyle};
  ${CustomPropertyNames.BorderStyleTranscriptVisualKeyboardIndicator}: ${transcriptVisualKeyboardIndicatorStyle};
  ${CustomPropertyNames.BorderWidthBubble}: ${bubbleBorderWidth}px;
  ${CustomPropertyNames.BorderWidthBubbleUser}: ${bubbleFromUserBorderWidth}px;
  ${CustomPropertyNames.BorderWidthTranscriptActivityVisualKeyboardIndicator}: ${transcriptActivityVisualKeyboardIndicatorWidth}px;
  ${CustomPropertyNames.BorderWidthTranscriptVisualKeyboardIndicator}: ${transcriptVisualKeyboardIndicatorWidth}px;
  ${CustomPropertyNames.ColorAccent}: ${accent};
  ${CustomPropertyNames.ColorBubble}: ${bubbleTextColor};
  ${CustomPropertyNames.ColorBubbleUser}: ${bubbleFromUserTextColor};
  ${CustomPropertyNames.ColorSubtle}: ${subtle};
  ${CustomPropertyNames.ColorTimestamp}: ${timestampColor || subtle};
  ${CustomPropertyNames.ColorTranscriptActivityVisualKeyboardIndicator}: ${transcriptActivityVisualKeyboardIndicatorColor};
  ${CustomPropertyNames.ColorTranscriptOverlayButton}: ${transcriptOverlayButtonColor};
  ${CustomPropertyNames.ColorTranscriptOverlayButtonDisabled}: ${transcriptOverlayButtonColorOnDisabled};
  ${CustomPropertyNames.ColorTranscriptOverlayButtonFocus}: ${transcriptOverlayButtonColorOnFocus};
  ${CustomPropertyNames.ColorTranscriptOverlayButtonHover}: ${transcriptOverlayButtonColorOnHover};
  ${CustomPropertyNames.ColorTranscriptTerminator}: ${transcriptTerminatorColor};
  ${CustomPropertyNames.ColorTranscriptVisualKeyboardIndicator}: ${transcriptVisualKeyboardIndicatorColor};
  ${CustomPropertyNames.FontMonospace}: ${monospaceFont};
  ${CustomPropertyNames.FontPrimary}: ${primaryFont};
  ${CustomPropertyNames.FontSizeSmall}: ${fontSizeSmall};
  ${CustomPropertyNames.FontSizeTranscriptTerminator}: ${transcriptTerminatorFontSize}px;
  ${CustomPropertyNames.IconURLExternalLink}: ${markdownExternalLinkIconImage};
  ${CustomPropertyNames.MaxHeightImageBubble}: ${bubbleImageMaxHeight}px;
  ${CustomPropertyNames.MaxHeightSendBoxAttachmentBar}: ${sendBoxAttachmentBarMaxHeight}px;
  ${CustomPropertyNames.MaxWidthAttachmentBubble}: ${bubbleAttachmentMaxWidth}px;
  ${CustomPropertyNames.MinWidthAttachmentBubble}: ${bubbleAttachmentMinWidth}px;
  ${CustomPropertyNames.MaxWidthMessageBubble}: ${bubbleMessageMaxWidth}px;
  ${CustomPropertyNames.MinWidthMessageBubble}: ${bubbleMessageMinWidth}px;
  ${CustomPropertyNames.MinHeightBubble}: ${bubbleMinHeight}px;
  ${CustomPropertyNames.MinHeightImageBubble}: ${bubbleImageMinHeight}px;
  ${CustomPropertyNames.PaddingRegular}: ${paddingRegular}px;
  ${CustomPropertyNames.SizeAvatar}: ${avatarSize}px;
  ${CustomPropertyNames.SizeBubbleNub}: ${bubbleNubSize === undefined ? 'unset' : `${bubbleNubSize}px`};
  ${CustomPropertyNames.SizeBubbleNubUser}: ${bubbleFromUserNubSize === undefined ? 'unset' : `${bubbleFromUserNubSize}px`};
  ${CustomPropertyNames.SpaceBubbleNub}: ${bubbleNubOffset}px;
  ${CustomPropertyNames.SpaceBubbleNubUser}: ${bubbleFromUserNubOffset}px;
  ${CustomPropertyNames.TransitionDuration}: ${transitionDuration};
  ${CustomPropertyNames.TransitionEasing}: ${transitionEasing};
  ${CustomPropertyNames.WordBreakMessageActivity}: ${messageActivityWordBreak};
  /* From bundle */
  ${bundleStyleProps}
}
`;
    const [style] = makeCreateStyles(contents)(`component/CustomPropertiesContainer-${uniqueId()}`);

    return [Object.freeze([style]), Object.freeze([`${webchatCustomPropertiesClass} ${randomClass}`] as const)];
  }, [styleOptions]);

  return (
    <div className={classNames(className, classNameState[0])} ref={ref}>
      <InjectStyleElements at={styleOptions.stylesRoot} nonce={nonce} styleElements={styleElements} />
      {children}
    </div>
  );
}

CustomPropertiesContainer.displayName = 'CustomPropertiesContainer';

export default memo(forwardRef<HTMLDivElement, CustomPropertiesContainerProps>(CustomPropertiesContainer));
