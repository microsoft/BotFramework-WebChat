import { hooks } from 'botframework-webchat-api';
import { useMemo } from 'react';
import CustomPropertyNames from '../Styles/CustomPropertyNames';
import { useInjectStyles } from '../internal/useInjectStyles';
import useNonce from '../hooks/internal/useNonce';

const { useStyleOptions } = hooks;

const webchatCustomPropertiesClass = 'webchat__css-custom-properties';

export default function useInjectCustomProperties() {
  const [styleOptions] = useStyleOptions();
  const nonce = useNonce();
  const [styles, className] = useMemo(() => {
    const {
      accent,
      subtle,
      timestampColor,
      primaryFont,
      fontSizeSmall,
      markdownExternalLinkIconImage,
      bubbleMaxWidth,
      bubbleMinHeight,
      paddingRegular
    } = styleOptions;

    // eslint-disable-next-line no-magic-numbers
    const randomClass = Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER).toString(36);

    const contents = `
.${webchatCustomPropertiesClass} .${randomClass} {
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
