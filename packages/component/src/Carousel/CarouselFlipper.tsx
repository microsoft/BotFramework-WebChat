import { useCarouselScrollBy } from '@msinternal/botframework-webchat-component-carousel';
import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { memo, useCallback, type MouseEvent } from 'react';
import { boolean, object, optional, picklist, pipe, readonly, string } from 'valibot';

import styles from './CarouselFlipper.module.css';

const { useDirection } = hooks;

const carouselFlipperPropsSchema = pipe(
  object({
    'aria-label': string(),
    /** Cannot scroll further in this direction. */
    atEdge: boolean(),
    /**
     * Slide out unless the container shows it (hover, scrolling) or it has focus, and at the edge unless it has keyboard
     * focus. Without auto-hide, the flipper is always shown and is disabled at the edge.
     */
    autoHide: optional(boolean()),
    mode: picklist(['next', 'previous'])
  }),
  readonly()
);

type CarouselFlipperProps = InferReactProps<typeof carouselFlipperPropsSchema>;

function CarouselFlipper(props: CarouselFlipperProps) {
  const { 'aria-label': ariaLabel, atEdge, autoHide = false, mode } = validateProps(carouselFlipperPropsSchema, props);

  const [direction] = useDirection();
  const classNames = useStyles(styles);
  const scrollBy = useCarouselScrollBy();

  const next = mode === 'next';

  // Deprecated react-film class names are physical: in RTL, "previous" is on the right side.
  const left = next === (direction === 'rtl');

  const handleClick = useCallback(
    ({ currentTarget, detail }: MouseEvent<HTMLButtonElement>) => {
      scrollBy(mode);

      // A mouse click moves the focus away, ENTER and SPACE (`detail` is 0) keep it on the button.
      detail && currentTarget.blur();
    },
    [mode, scrollBy]
  );

  return (
    <button
      // Not `disabled`: the flipper keeps the focus when it reaches the edge.
      aria-disabled={atEdge && !autoHide ? 'true' : undefined}
      aria-label={ariaLabel}
      className={cx(
        classNames['carousel-flipper'],
        next ? classNames['carousel-flipper--next'] : classNames['carousel-flipper--previous'],
        { [classNames['carousel-flipper--auto-hide']]: autoHide },
        'react-film__flipper',
        'react-film__main__overlay',
        left ? 'react-film__flipper--left' : 'react-film__flipper--right'
      )}
      onClick={handleClick}
      type="button"
    >
      <div
        className={cx(
          classNames['carousel-flipper__slider'],
          { [classNames['carousel-flipper__slider--at-edge']]: atEdge },
          'react-film__flipper__slider',
          'react-film__main__slider',
          left ? 'react-film__main__slider--left' : 'react-film__main__slider--right',
          { 'react-film__main__slider--hide': atEdge }
        )}
      >
        {/* "<" and ">" are mirrored in RTL text. */}
        <div className={cx(classNames['carousel-flipper__body'], 'react-film__flipper__body')}>{next ? '>' : '<'}</div>
      </div>
    </button>
  );
}

CarouselFlipper.displayName = 'CarouselFlipper';

export default memo(CarouselFlipper);
export { carouselFlipperPropsSchema, type CarouselFlipperProps };
