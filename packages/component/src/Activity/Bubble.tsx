/* eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 1, 2, 10] }] */

import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { memo } from 'react';
import { boolean, literal, object, optional, pipe, readonly, string, union, type InferInput } from 'valibot';

import isZeroOrPositive from '../Utils/isZeroOrPositive';

import styles from './Bubble.module.css';

const { useStyleOptions } = hooks;

function acuteNubSVG(nubSize, strokeWidth, side, upSideDown = false, classNames) {
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
      className={classNames['bubble__nub']}
      version="1.1"
      viewBox={`0 0 ${nubSize} ${nubSize}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform={`${horizontalTransform} ${verticalTransform}`}>
        <path className={classNames['bubble__nub-outline']} d={`M${p1} L${p2} L${p3}`} />
      </g>
    </svg>
  );
}

const bubblePropsSchema = pipe(
  object({
    'aria-hidden': optional(boolean()),
    children: optional(reactNode()),
    className: optional(string()),
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
    fromUser,
    nub = false
  } = validateProps(bubblePropsSchema, props);

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
  const classNames = useStyles(styles);

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
      className={cx(
        classNames.bubble,
        {
          [classNames['bubble--from-user']]: fromUser,
          [classNames['bubble--hide-nub']]: nub !== true && nub !== false,
          [classNames['bubble--nub-on-top']]: isZeroOrPositive(nubOffset),
          [classNames['bubble--show-nub']]: nub === true
        },
        className
      )}
    >
      <div className={classNames['bubble__nub-pad']} />
      <div className={classNames['bubble__content']}>{children}</div>
      {nub === true && acuteNubSVG(nubSize, borderWidth, side, !isZeroOrPositive(nubOffset), classNames)}
    </div>
  );
}

export default memo(Bubble);
export { bubblePropsSchema, type BubbleProps };
