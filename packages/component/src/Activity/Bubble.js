import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

const ROOT_CSS = css({
  position: 'relative',

  '& > .webchat__bubble__content': {
    // This is for hiding content outside of the bubble, for example, content outside of border radius
    overflow: 'hidden'
  },

  '& > .webchat__bubble__nub': {
    position: 'absolute'
  }
});

function acuteNubSVG(nubSize, backgroundColor, color, strokeWidth, side, upSideDown = false) {
  const halfNubSize = nubSize / 2;
  const halfStrokeWidth = strokeWidth / 2;
  const horizontalTransform =
    side === 'bot' ? '' : `translate(${halfNubSize} 0) scale(-1 1) translate(${-halfNubSize} 0)`;
  const verticalTransform = upSideDown ? `translate(0 ${halfNubSize}) scale(1 -1) translate(0 ${-halfNubSize})` : '';

  const p1 = [nubSize, halfStrokeWidth].join(' ');
  const p2 = [strokeWidth, halfStrokeWidth].join(' ');
  const p3 = [nubSize + strokeWidth, nubSize + halfStrokeWidth].join(' ');

  return (
    <svg
      className="webchat__bubble__nub"
      version="1.1"
      viewBox={`0 0 ${nubSize} ${nubSize}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform={`${horizontalTransform} ${verticalTransform}`}>
        <path d={`M${p1} L${p2} L${p3}`} fill={backgroundColor} stroke={color} strokeWidth={strokeWidth} />
      </g>
    </svg>
  );
}

function isPositive(value) {
  return 1 / value >= 0;
}

const Bubble = ({ 'aria-hidden': ariaHidden, children, className, fromUser, nub, styleSet }) => {
  const {
    bubbleBackground,
    bubbleBorderColor,
    bubbleBorderWidth,
    bubbleFromUserBackground,
    bubbleFromUserBorderColor,
    bubbleFromUserBorderWidth,
    bubbleFromUserNubOffset,
    bubbleFromUserNubSize,
    bubbleNubOffset,
    bubbleNubSize
  } = styleSet.options;

  return (
    <div
      aria-hidden={ariaHidden}
      className={classNames(
        ROOT_CSS + '',
        styleSet.bubble + '',
        { 'from-user': fromUser, webchat__bubble_has_nub: nub },
        className + '' || ''
      )}
    >
      <div className="webchat__bubble__content">{children}</div>
      {nub &&
        !!(fromUser ? styleSet.options.bubbleFromUserNubSize : styleSet.options.bubbleNubSize) &&
        (fromUser
          ? acuteNubSVG(
              bubbleFromUserNubSize,
              bubbleFromUserBackground,
              bubbleFromUserBorderColor,
              bubbleFromUserBorderWidth,
              'user',
              !isPositive(bubbleFromUserNubOffset)
            )
          : acuteNubSVG(
              bubbleNubSize,
              bubbleBackground,
              bubbleBorderColor,
              bubbleBorderWidth,
              'bot',
              !isPositive(bubbleNubOffset)
            ))}
    </div>
  );
};

Bubble.defaultProps = {
  'aria-hidden': false,
  children: undefined,
  className: '',
  fromUser: false,
  nub: true
};

Bubble.propTypes = {
  'aria-hidden': PropTypes.bool,
  children: PropTypes.any,
  className: PropTypes.string,
  fromUser: PropTypes.bool,
  nub: PropTypes.bool,
  styleSet: PropTypes.shape({
    bubble: PropTypes.any.isRequired,
    options: PropTypes.shape({
      bubbleNubSize: PropTypes.number.isRequired,
      bubbleFromUserNubSize: PropTypes.number.isRequired
    }).isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(Bubble);
