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
      bubbleImageMaxHeight,
      bubbleImageMinHeight,
      bubbleMessageMaxWidth,
      bubbleMessageMinWidth,
      bubbleMinHeight,
      fontColorPrimary,
      fontColorSecondary,
      primaryButtonBackgroundColor,
      primaryButtonFontColor,
      primaryButtonBackgroundColorOnHover,
      primaryButtonBackgroundColorOnActive,
      primaryButtonBackgroundColorOnDisabled,
      secondaryButtonBackgroundColor,
      secondaryButtonFontColor,
      secondaryButtonBackgroundColorOnHover,
      secondaryButtonBorderColor,
      textBoxBackgroundColor,
      textBoxBorderColor,
      textBoxBorderColorOnFocus,
      textBoxBorderColorOnActive,
      textBoxMinHeight,
      textBoxMinWidth,
      textBoxTextColor,
      fontSizeSmall,
      markdownExternalLinkIconImage,
      paddingRegular,
      primaryFont,
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
  ${CustomPropertyNames.ColorAccent}: ${accent};
  ${CustomPropertyNames.ColorSubtle}: ${subtle};
  ${CustomPropertyNames.ColorTimestamp}: ${timestampColor || subtle};
  ${CustomPropertyNames.FontPrimary}: ${primaryFont};
  ${CustomPropertyNames.FontSizeSmall}: ${fontSizeSmall};
  ${CustomPropertyNames.IconURLExternalLink}: ${markdownExternalLinkIconImage};
  ${CustomPropertyNames.MaxHeightImageBubble}: ${bubbleImageMaxHeight}px;
  ${CustomPropertyNames.MaxWidthAttachmentBubble}: ${bubbleAttachmentMaxWidth}px;
  ${CustomPropertyNames.MinWidthAttachmentBubble}: ${bubbleAttachmentMinWidth}px;
  ${CustomPropertyNames.MaxWidthMessageBubble}: ${bubbleMessageMaxWidth}px;
  ${CustomPropertyNames.MinWidthMessageBubble}: ${bubbleMessageMinWidth}px;
  ${CustomPropertyNames.MinHeightBubble}: ${bubbleMinHeight}px;
  ${CustomPropertyNames.MinHeightImageBubble}: ${bubbleImageMinHeight}px;
  ${CustomPropertyNames.PaddingRegular}: ${paddingRegular}px;
  ${CustomPropertyNames.SizeAvatar}: ${avatarSize}px;
  ${CustomPropertyNames.FeedbackFormFont}: ${primaryFont};
  ${CustomPropertyNames.FeedbackFormTitleColor}: ${fontColorPrimary};
  ${CustomPropertyNames.FeedbackFormDisclaimerColor}: ${fontColorSecondary};
  ${CustomPropertyNames.FeedbackFormSubmitButtonColor}: ${primaryButtonBackgroundColor};
  ${CustomPropertyNames.FeedbackFormSubmitButtonFontColor}: ${primaryButtonFontColor};
  ${CustomPropertyNames.FeedbackFormSubmitButtonHoverColor}: ${primaryButtonBackgroundColorOnHover};
  ${CustomPropertyNames.FeedbackFormSubmitButtonActiveColor}: ${primaryButtonBackgroundColorOnActive};
  ${CustomPropertyNames.FeedbackFormSubmitButtonDisabledColor}: ${primaryButtonBackgroundColorOnDisabled};
  ${CustomPropertyNames.FeedbackFormCancelButtonColor}: ${secondaryButtonBackgroundColor};
  ${CustomPropertyNames.FeedbackFormCancelButtonBorderColor}: ${secondaryButtonBorderColor};
  ${CustomPropertyNames.FeedbackFormCancelButtonFontColor}: ${secondaryButtonFontColor};
  ${CustomPropertyNames.FeedbackFormCancelButtonHoverColor}: ${secondaryButtonBackgroundColorOnHover};
  ${CustomPropertyNames.FeedbackFormSendBoxBackgroundColor}: ${textBoxBackgroundColor};
  ${CustomPropertyNames.FeedbackFormSendBoxBorderColor}: ${textBoxBorderColor};
  ${CustomPropertyNames.FeedbackFormSendBoxFontColor}: ${textBoxTextColor};
  ${CustomPropertyNames.FeedbackFormSendBoxFocusBorderColor}: ${textBoxBorderColorOnFocus};
  ${CustomPropertyNames.FeedbackFormSendBoxActiveBorderColor}: ${textBoxBorderColorOnActive};
  ${CustomPropertyNames.FeedbackFormSendBoxMinHeight}: ${textBoxMinHeight}px;
  ${CustomPropertyNames.FeedbackFormSendBoxMinWidth}: ${textBoxMinWidth}px;
  ${CustomPropertyNames.FeedbackFormSendBoxPadding}: ${paddingRegular}px;
}
`;
    const [style] = makeCreateStyles(contents)();

    style.dataset.webchatInjected = 'component';

    return [Object.freeze([style]), Object.freeze([`${webchatCustomPropertiesClass} ${randomClass}`] as const)];
  }, [styleOptions]);

  useInjectStyles(styles, nonce);

  return classNameState;
}
