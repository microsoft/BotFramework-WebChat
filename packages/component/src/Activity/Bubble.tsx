/* eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 1, 2, 10] }] */

import { hooks } from 'botframework-webchat-api';
import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { memo } from 'react';
import { boolean, literal, object, optional, pipe, readonly, string, union, type InferInput } from 'valibot';

import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import useStyleSet from '../hooks/useStyleSet';
import isZeroOrPositive from '../Utils/isZeroOrPositive';

const { useDirection, useStyleOptions } = hooks;

const ROOT_STYLE = {
  '&.webchat__bubble': {
    display: 'flex',
    position: 'relative',

    '& .webchat__bubble__nub-pad': {
      flexShrink: 0
    },

    '& .webchat__bubble__content': {
      flexGrow: 1,

      // This is for hiding content outside of the bubble, for example, content outside of border radius
      overflow: 'hidden'
    }
  }
};

function acuteNubSVG(nubSize, strokeWidth, side, upSideDown = false) {
  if (typeof nubSize !== 'number') {
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
        <path className="webchat__bubble__nub-outline" d={`M${p1} L${p2} L${p3}`} />
      </g>
    </svg>
  );
}

const bubblePropsSchema = pipe(
  object({
    'aria-hidden': optional(boolean()),
    children: optional(reactNode()),
    className: optional(string()),
    contentClassName: optional(string()),
    fromUser: optional(boolean()),
    nub: optional(union([boolean(), literal('hidden')]))
  }),
  readonly()
);

type BubbleProps = InferInput<typeof bubblePropsSchema>;

function Bubble(props: BubbleProps) {
  const {
    'aria-hidden': ariaHidden,
    children,
    className,
    contentClassName,
    fromUser,
    nub = false
  } = validateProps(bubblePropsSchema, props);

  const [{ bubble: bubbleStyleSet }] = useStyleSet();
  const [direction] = useDirection();
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
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

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
        'webchat__bubble',
        {
          'webchat__bubble--from-user': fromUser,
          'webchat__bubble--hide-nub': nub !== true && nub !== false,
          'webchat__bubble--nub-on-top': isZeroOrPositive(nubOffset),
          'webchat__bubble--rtl': direction === 'rtl',
          'webchat__bubble--show-nub': nub === true
        },
        rootClassName,
        bubbleStyleSet + '',
        className
      )}
    >
      <div className="webchat__bubble__nub-pad" />
      <div className={classNames('webchat__bubble__content', contentClassName)}>{children}</div>
      {nub === true && acuteNubSVG(nubSize, borderWidth, side, !isZeroOrPositive(nubOffset))}
    </div>
  );
}

export default memo(Bubble);
export { bubblePropsSchema, type BubbleProps };
