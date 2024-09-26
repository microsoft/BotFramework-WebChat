import { hooks } from 'botframework-webchat-api';
import { useMemo } from 'react';
import CustomPropertyNames from './CustomPropertyNames';
import useInjectStyles from '../hooks/internal/useInjectStyles';
import useNonce from '../hooks/internal/useNonce';

const { useStyleOptions } = hooks;

const webchatCustomPropertiesClass = 'webchat__css-custom-properties';

export default function useInjectCustomProperties() {
  const [styleOptions] = useStyleOptions();
  const nonce = useNonce();
  const [styles, className] = useMemo(() => {
    const {
      accent,
      borderAnimationColor1,
      borderAnimationColor2,
      borderAnimationColor3,
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
    const randomClass = `wc-${Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)}`;

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
  ${CustomPropertyNames.MaxWidthBubble}: ${bubbleMaxWidth}px;
  ${CustomPropertyNames.MinHeightBubble}: ${bubbleMinHeight}px;
  ${CustomPropertyNames.PaddingRegular}: ${paddingRegular}px;
}
`;
    const style = document.createElement('style');
    style.append(document.createTextNode(contents));
    return [[style], `${webchatCustomPropertiesClass} ${randomClass}`];
  }, [styleOptions]);

  useInjectStyles(styles, nonce);

  return className;
}
