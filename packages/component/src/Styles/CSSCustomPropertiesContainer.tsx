import { InjectStyleElements } from '@msinternal/botframework-webchat-component-inject-style-elements';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { makeCreateStyles } from '@msinternal/botframework-webchat-styles';
import { useStyleOptions } from 'botframework-webchat-api/hook';
import classNames from 'classnames';
import random from 'math-random';
import React, { memo, useMemo } from 'react';
import { object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';
import CustomPropertyNames from './CustomPropertyNames';

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

function CustomPropertiesContainer(props: CustomPropertiesContainerProps) {
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
      bubbleBorderColor,
      bubbleBorderRadius,
      bubbleBorderStyle,
      bubbleBorderWidth,
      bubbleImageMaxHeight,
      bubbleImageMinHeight,
      bubbleMessageMaxWidth,
      bubbleMessageMinWidth,
      bubbleMinHeight,
      fontSizeSmall,
      markdownExternalLinkIconImage,
      paddingRegular,
      primaryFont,
      sendBoxAttachmentBarMaxHeight,
      subtle,
      timestampColor,
      transcriptActivityVisualKeyboardIndicatorColor,
      transcriptActivityVisualKeyboardIndicatorStyle,
      transcriptActivityVisualKeyboardIndicatorWidth,
      transcriptTerminatorBackgroundColor,
      transcriptTerminatorBorderRadius,
      transcriptTerminatorColor,
      transcriptTerminatorFontSize,
      transcriptVisualKeyboardIndicatorColor,
      transcriptVisualKeyboardIndicatorStyle,
      transcriptVisualKeyboardIndicatorWidth,
      transitionDuration
    } = styleOptions;

    const randomClass = `w${uniqueId()}_${webchatCustomPropertiesClass.replace('webchat__', '')}` as const;

    const contents = `
.${webchatCustomPropertiesClass}.${randomClass} {
  display: contents;
  ${CustomPropertyNames.BackgroundTranscriptTerminator}: ${transcriptTerminatorBackgroundColor};
  ${CustomPropertyNames.BorderAnimationColor1}: ${borderAnimationColor1};
  ${CustomPropertyNames.BorderAnimationColor2}: ${borderAnimationColor2};
  ${CustomPropertyNames.BorderAnimationColor3}: ${borderAnimationColor3};
  ${CustomPropertyNames.BorderColorBubble}: ${bubbleBorderColor};
  ${CustomPropertyNames.BorderRadiusBubble}: ${bubbleBorderRadius}px;
  ${CustomPropertyNames.BorderRadiusTranscriptTerminator}: ${transcriptTerminatorBorderRadius}px;
  ${CustomPropertyNames.BorderStyleBubble}: ${bubbleBorderStyle};
  ${CustomPropertyNames.BorderStyleTranscriptActivityVisualKeyboardIndicator}: ${transcriptActivityVisualKeyboardIndicatorStyle};
  ${CustomPropertyNames.BorderStyleTranscriptVisualKeyboardIndicator}: ${transcriptVisualKeyboardIndicatorStyle};
  ${CustomPropertyNames.BorderWidthBubble}: ${bubbleBorderWidth}px;
  ${CustomPropertyNames.BorderWidthTranscriptActivityVisualKeyboardIndicator}: ${transcriptActivityVisualKeyboardIndicatorWidth}px;
  ${CustomPropertyNames.BorderWidthTranscriptVisualKeyboardIndicator}: ${transcriptVisualKeyboardIndicatorWidth}px;
  ${CustomPropertyNames.ColorAccent}: ${accent};
  ${CustomPropertyNames.ColorSubtle}: ${subtle};
  ${CustomPropertyNames.ColorTimestamp}: ${timestampColor || subtle};
  ${CustomPropertyNames.ColorTranscriptActivityVisualKeyboardIndicator}: ${transcriptActivityVisualKeyboardIndicatorColor};
  ${CustomPropertyNames.ColorTranscriptTerminator}: ${transcriptTerminatorColor};
  ${CustomPropertyNames.ColorTranscriptVisualKeyboardIndicator}: ${transcriptVisualKeyboardIndicatorColor};
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
  ${CustomPropertyNames.TransitionDuration}: ${transitionDuration};
}
`;
    const [style] = makeCreateStyles(contents)(`component/CustomPropertiesContainer-${uniqueId()}`);

    return [Object.freeze([style]), Object.freeze([`${webchatCustomPropertiesClass} ${randomClass}`] as const)];
  }, [styleOptions]);

  return (
    <div className={classNames(className, classNameState[0])}>
      <InjectStyleElements at={styleOptions.stylesRoot} nonce={nonce} styleElements={styleElements} />
      {children}
    </div>
  );
}

CustomPropertiesContainer.displayName = 'CustomPropertiesContainer';

export default memo(CustomPropertiesContainer);
