/* eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 1, 2, 10] }] */

import Color from 'color';

function acuteNubSVG(nubSize = 10, backgroundColor, color, strokeWidth = 1, side = 'bot', upSideDown = false) {
  const halfNubSize = nubSize / 2;
  const halfStrokeWidth = strokeWidth / 2;
  const horizontalTransform =
    side === 'bot' ? '' : `translate(${halfNubSize} 0) scale(-1 1) translate(${-halfNubSize} 0)`;
  const verticalTransform = upSideDown ? `translate(0 ${halfNubSize}) scale(1 -1) translate(0 ${-halfNubSize})` : '';

  const p1 = [nubSize, halfStrokeWidth].join(' ');
  const p2 = [strokeWidth, halfStrokeWidth].join(' ');
  const p3 = [nubSize + strokeWidth, nubSize + halfStrokeWidth].join(' ');

  return `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${nubSize} ${nubSize}"><g transform="${horizontalTransform} ${verticalTransform}"><path d="M${p1} L${p2} L${p3}" fill="${Color(
    (backgroundColor || '').toLowerCase()
  )
    .rgb()
    .string()}" stroke="${Color((color || '').toLowerCase())
    .rgb()
    .string()}" stroke-width="${strokeWidth}px" /></g></svg>`;
}

function isPositive(value) {
  return 1 / value >= 0;
}

function svgToDataURI(svg) {
  return `data:image/svg+xml;utf8,${svg.replace(/"/gu, "'")}`;
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
  bubbleMinHeight,
  bubbleNubOffset,
  bubbleNubSize,
  bubbleTextColor,
  messageActivityWordBreak,
  paddingRegular
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

  const botNubSVG = acuteNubSVG(
    bubbleNubSize,
    bubbleBackground,
    bubbleBorderColor,
    bubbleBorderWidth,
    'bot',
    botNubUpSideDown
  );
  const userNubSVG = acuteNubSVG(
    bubbleFromUserNubSize,
    bubbleFromUserBackground,
    bubbleFromUserBorderColor,
    bubbleFromUserBorderWidth,
    'user',
    userNubUpSideDown
  );

  const botNubCornerRadius = Math.min(bubbleBorderRadius, Math.abs(bubbleNubOffset));
  const userNubCornerRadius = Math.min(bubbleFromUserBorderRadius, Math.abs(bubbleFromUserNubOffset));

  return {
    '& > .webchat__bubble__content': {
      wordBreak: messageActivityWordBreak
    },

    '&:not(.from-user)': {
      '&.webchat__bubble_has_nub': {
        '& > .webchat__bubble__content': bubbleNubSize ? { marginLeft: paddingRegular } : {}
      },

      '& > .webchat__bubble__content': {
        background: bubbleBackground,
        borderColor: bubbleBorderColor,
        borderRadius: bubbleBorderRadius,
        borderStyle: bubbleBorderStyle,
        borderWidth: bubbleBorderWidth,
        color: bubbleTextColor,
        minHeight: bubbleMinHeight - bubbleBorderWidth * 2
      },

      '&.webchat__bubble_has_nub > .webchat__bubble__content': {
        // Hide border radius if there is a nub on the top/bottom left corner
        ...(bubbleNubSize && botNubUpSideDown ? { borderBottomLeftRadius: botNubCornerRadius } : {}),
        ...(bubbleNubSize && !botNubUpSideDown ? { borderTopLeftRadius: botNubCornerRadius } : {})
      },

      '& > .webchat__bubble__nub': {
        backgroundImage: `url("${svgToDataURI(botNubSVG).replace(/"/gu, "'")}")`,
        bottom: isPositive(bubbleNubOffset) ? undefined : -bubbleNubOffset,
        height: bubbleNubSize,
        left: bubbleBorderWidth - bubbleNubSize + paddingRegular,
        top: isPositive(bubbleNubOffset) ? bubbleNubOffset : undefined,
        width: bubbleNubSize
      }
    },

    '&.from-user': {
      '&.webchat__bubble_has_nub': {
        '& > .webchat__bubble__content': bubbleNubSize ? { marginRight: paddingRegular } : {}
      },

      '& > .webchat__bubble__content': {
        background: bubbleFromUserBackground,
        borderColor: bubbleFromUserBorderColor,
        borderRadius: bubbleFromUserBorderRadius,
        borderStyle: bubbleFromUserBorderStyle,
        borderWidth: bubbleFromUserBorderWidth,
        color: bubbleFromUserTextColor,
        minHeight: bubbleMinHeight - bubbleFromUserBorderWidth * 2
      },

      '&.webchat__bubble_has_nub > .webchat__bubble__content': {
        // Hide border radius if there is a nub on the top/bottom right corner
        ...(bubbleFromUserNubSize && userNubUpSideDown ? { borderBottomRightRadius: userNubCornerRadius } : {}),
        ...(bubbleFromUserNubSize && !userNubUpSideDown ? { borderTopRightRadius: userNubCornerRadius } : {})
      },

      '& > .webchat__bubble__nub': {
        backgroundImage: `url("${svgToDataURI(userNubSVG).replace(/"/gu, "'")}")`,
        height: bubbleFromUserNubSize,
        right: bubbleFromUserBorderWidth - bubbleFromUserNubSize + paddingRegular,
        bottom: isPositive(bubbleFromUserNubOffset) ? undefined : -bubbleFromUserNubOffset,
        top: isPositive(bubbleFromUserNubOffset) ? bubbleFromUserNubOffset : undefined,
        width: bubbleFromUserNubSize
      }
    }
  };
}
