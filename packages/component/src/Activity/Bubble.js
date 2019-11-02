/* eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 1, 2, 10] }] */

import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';

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

function acuteNubSVG(nubSize, strokeWidth, side, upSideDown = false) {
  if (!nubSize) {
    return false;
  }

  const halfNubSize = nubSize / 2;
  const halfStrokeWidth = strokeWidth / 2;

  // Horizontally mirror the nub if it is from user
  const horizontalTransform =
    side === 'bot' ? '' : `translate(${halfNubSize} 0) scale(-1 1) translate(${-halfNubSize} 0)`;

  // Vertically mirror the nub if it is up-side-down
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
        <path d={`M${p1} L${p2} L${p3}`} />
      </g>
    </svg>
  );
}

function isPositive(value) {
  return 1 / value >= 0;
}

const Bubble = ({ 'aria-hidden': ariaHidden, children, className, fromUser, nub }) => {
  const [{ bubble: bubbleStyleSet }] = useStyleSet();

  const [
    {
      bubbleBorderWidth,
      bubbleFromUserBorderWidth,
      bubbleFromUserNubSize,
      bubbleNubSize,
      bubbleNubOffset,
      bubbleFromUserNubOffset
    }
  ] = useStyleOptions();

  const { borderWidth, nubOffset, nubSize, side } = fromUser
    ? {
        borderWidth: bubbleFromUserBorderWidth,
        nubOffset: bubbleFromUserNubOffset,
        nubSize: bubbleFromUserNubSize,
        side: 'user'
      }
    : {
        borderWidth: bubbleBorderWidth,
        nubOffset: bubbleNubOffset,
        nubSize: bubbleNubSize,
        side: 'bot'
      };

  return (
    <div
      aria-hidden={ariaHidden}
      className={classNames(
        ROOT_CSS + '',
        bubbleStyleSet + '',
        { 'from-user': fromUser, webchat__bubble_has_nub: nub },
        className + '' || ''
      )}
    >
      <div className="webchat__bubble__content">{children}</div>
      {nub && acuteNubSVG(nubSize, borderWidth, side, !isPositive(nubOffset))}
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
  nub: PropTypes.bool
};

export default Bubble;
