import { hooks } from 'botframework-webchat-api';
import { makeCreateStyles } from 'botframework-webchat-styles';
import random from 'math-random';
import { useMemo } from 'react';
import CustomPropertyNames from './CustomPropertyNames';
import useInjectStyles from '../hooks/internal/useInjectStyles';
import useNonce from '../hooks/internal/useNonce';

const { useStyleOptions } = hooks;

const webchatCustomPropertiesClass = 'webchat__css-custom-properties';

export default function useCustomPropertiesClassName() {
  const [styleOptions] = useStyleOptions();
  const nonce = useNonce();

  const [styles, classNameState] = useMemo(() => {
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
      timestampColor
    } = styleOptions;

    // eslint-disable-next-line no-magic-numbers
    const randomClass = `wc-${Math.ceil(random() * Number.MAX_SAFE_INTEGER).toString(36)}` as const;

    const contents = `
.${webchatCustomPropertiesClass}.${randomClass} {
  display: contents;
  ${CustomPropertyNames.BorderAnimationColor1}: ${borderAnimationColor1};
  ${CustomPropertyNames.BorderAnimationColor2}: ${borderAnimationColor2};
  ${CustomPropertyNames.BorderAnimationColor3}: ${borderAnimationColor3};
  ${CustomPropertyNames.BorderColorBubble}: ${bubbleBorderColor};
  ${CustomPropertyNames.BorderRadiusBubble}: ${bubbleBorderRadius}px;
  ${CustomPropertyNames.BorderStyleBubble}: ${bubbleBorderStyle};
  ${CustomPropertyNames.BorderWidthBubble}: ${bubbleBorderWidth}px;
  ${CustomPropertyNames.ColorAccent}: ${accent};
  ${CustomPropertyNames.ColorSubtle}: ${subtle};
  ${CustomPropertyNames.ColorTimestamp}: ${timestampColor || subtle};
  ${CustomPropertyNames.FontPrimary}: ${primaryFont};
  ${CustomPropertyNames.FontSizeSmall}: ${fontSizeSmall};
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
}
`;
    const [style] = makeCreateStyles(contents)();

    style.dataset.webchatInjected = 'component';

    return [Object.freeze([style]), Object.freeze([`${webchatCustomPropertiesClass} ${randomClass}`] as const)];
  }, [styleOptions]);

  useInjectStyles(styles, nonce);

  return classNameState;
}
