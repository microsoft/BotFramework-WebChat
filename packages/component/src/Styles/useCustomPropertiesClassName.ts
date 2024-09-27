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
      borderAnimationColor1,
      borderAnimationColor2,
      borderAnimationColor3,
      bubbleImageMaxHeight,
      bubbleImageMinHeight,
      bubbleMaxWidth,
      bubbleMinHeight,
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
  ${CustomPropertyNames.MaxWidthBubble}: ${bubbleMaxWidth}px;
  ${CustomPropertyNames.MinHeightBubble}: ${bubbleMinHeight}px;
  ${CustomPropertyNames.MinHeightImageBubble}: ${bubbleImageMinHeight}px;
  ${CustomPropertyNames.PaddingRegular}: ${paddingRegular}px;
}
`;
    const [style] = makeCreateStyles(contents)();

    style.dataset.webchatInjected = 'component';

    return [Object.freeze([style]), Object.freeze([`${webchatCustomPropertiesClass} ${randomClass}`] as const)];
  }, [styleOptions]);

  useInjectStyles(styles, nonce);

  return classNameState;
}
