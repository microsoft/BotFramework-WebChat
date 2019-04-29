import Color from 'color';

function acuteNubSVG(
  nubSize = 10,
  backgroundColor,
  color,
  strokeWidth = 1,
  side = 'bot',
  upSideDown = false
) {
  const halfNubSize = nubSize / 2;
  const halfStrokeWidth = strokeWidth / 2;
  const horizontalTransform = side === 'bot' ? '' : `translate(${ halfNubSize } 0) scale(-1 1) translate(${ -halfNubSize } 0)`;
  const verticalTransform = upSideDown ? `translate(0 ${ halfNubSize }) scale(1 -1) translate(0 ${ -halfNubSize })` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${ nubSize } ${ nubSize }"><g transform="${ horizontalTransform } ${ verticalTransform }"><path d="M${ nubSize } ${ halfStrokeWidth } L${ strokeWidth } ${ halfStrokeWidth } L${ nubSize + strokeWidth } ${ nubSize + halfStrokeWidth }" fill="${ Color((backgroundColor || '').toLowerCase()).rgb().string() }" stroke="${ Color((color || '').toLowerCase()).rgb().string() }" stroke-width="${ strokeWidth }px" /></g></svg>`;
}

function isPositive(value) {
  return (1 / value) >= 0;
}

function svgToDataURI(svg) {
  return `data:image/svg+xml;utf8,${ svg.replace(/"/g, '\'') }`;
}

export default function createBubbleStyle({
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
  bubbleMaxWidth,
  bubbleMinHeight,
  bubbleNubOffset,
  bubbleNubSize,
  bubbleTextColor,
  messageActivityWordBreak
}) {
  if (bubbleFromUserNubOffset === 'top') {
    bubbleFromUserNubOffset = 0;
  } else if (typeof bubbleFromUserNubOffset !== 'number') {
    bubbleFromUserNubOffset = -0;
  }

  if (bubbleNubOffset === 'top') {
    bubbleNubOffset = 0;
  } else if (typeof bubbleNubOffset !== 'number') {
    bubbleNubOffset = -0;
  }

  const botNubUpSideDown = !isPositive(bubbleNubOffset);
  const userNubUpSideDown = !isPositive(bubbleFromUserNubOffset);

  const botNub = acuteNubSVG(bubbleNubSize, bubbleBackground, bubbleBorderColor, bubbleBorderWidth, 'bot', botNubUpSideDown);
  const userNub = acuteNubSVG(bubbleFromUserNubSize, bubbleFromUserBackground, bubbleFromUserBorderColor, bubbleFromUserBorderWidth, 'user', userNubUpSideDown);

  const botNubCornerRadius = Math.min(bubbleBorderRadius, Math.abs(bubbleNubOffset));
  const userNubCornerRadius = Math.min(bubbleFromUserBorderRadius, Math.abs(bubbleFromUserNubOffset));

  return {
    maxWidth: bubbleMaxWidth,
    minHeight: bubbleMinHeight,
    wordBreak: messageActivityWordBreak,

    '&:not(.from-user)': {
      '& > .content': {
        background: bubbleBackground,
        borderColor: bubbleBorderColor,
        borderRadius: bubbleBorderRadius,
        borderStyle: bubbleBorderStyle,
        borderWidth: bubbleBorderWidth,
        color: bubbleTextColor,
        overflow: 'hidden'
      },

      '&:not(.hide-nub) > .content': {
        // Hide border radius if there is a nub on the top/bottom left corner
        ...(bubbleNubSize && botNubUpSideDown) ? { borderBottomLeftRadius: botNubCornerRadius } : {},
        ...(bubbleNubSize && !botNubUpSideDown) ? { borderTopLeftRadius: botNubCornerRadius } : {}
      },

      '& > .nub': {
        backgroundImage: `url("${ svgToDataURI(botNub).replace(/"/g, '\'') }")`,
        bottom: isPositive(bubbleNubOffset) ? undefined : -bubbleNubOffset,
        height: bubbleNubSize,
        left: bubbleBorderWidth - bubbleNubSize,
        top: isPositive(bubbleNubOffset) ? bubbleNubOffset : undefined,
        width: bubbleNubSize
      }
    },

    '&.from-user': {
      '& > .content': {
        background: bubbleFromUserBackground,
        borderColor: bubbleFromUserBorderColor,
        borderRadius: bubbleFromUserBorderRadius,
        borderStyle: bubbleFromUserBorderStyle,
        borderWidth: bubbleFromUserBorderWidth,
        color: bubbleFromUserTextColor,
        overflow: 'hidden'
      },

      '&:not(.hide-nub) > .content': {
        // Hide border radius if there is a nub on the top/bottom right corner
        ...(bubbleFromUserNubSize && userNubUpSideDown) ? { borderBottomRightRadius: userNubCornerRadius } : {},
        ...(bubbleFromUserNubSize && !userNubUpSideDown) ? { borderTopRightRadius: userNubCornerRadius } : {}
      },

      '& > .nub': {
        backgroundImage: `url("${ svgToDataURI(userNub).replace(/"/g, '\'') }")`,
        height: bubbleFromUserNubSize,
        right: bubbleFromUserBorderWidth - bubbleFromUserNubSize,
        bottom: isPositive(bubbleFromUserNubOffset) ? undefined : -bubbleFromUserNubOffset,
        top: isPositive(bubbleFromUserNubOffset) ? bubbleFromUserNubOffset : undefined,
        width: bubbleFromUserNubSize
      }
    }
  };
}
