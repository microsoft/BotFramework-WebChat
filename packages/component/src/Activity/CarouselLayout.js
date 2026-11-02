import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import {
  Composer as FilmComposer,
  createBasicStyleSet as createBasicStyleSetForReactFilm,
  Flipper,
  useScrollBarWidth,
  useScrolling,
  useStyleSetClassNames as useReactFilmStyleSetClassNames
} from 'react-film';

import cx from 'classnames';
import React, { memo, useMemo } from 'react';
import { any, array, boolean, function_, literal, nullish, object, pipe, readonly, union } from 'valibot';

import CarouselFilmStrip from './CarouselFilmStrip';
import useNonce from '../hooks/internal/useNonce';

import styles from './CarouselLayout.module.css';

const { useDirection, useLocalizer, useStyleOptions } = hooks;

const carouselLayoutPropsSchema = pipe(
  object({
    // `activity` is required, but `CarouselLayout` has a default value for it.
    activity: nullish(pipe(object({ attachments: nullish(array(any())) }), readonly())),
    hideTimestamp: nullish(boolean()),
    renderActivityStatus: nullish(union([literal(false), function_()])),
    renderAttachment: function_(),
    renderAvatar: nullish(union([literal(false), function_()])),
    showCallout: nullish(boolean())
  }),
  readonly()
);

const CarouselLayoutCore = props => {
  const {
    activity,
    hideTimestamp = false,
    renderActivityStatus = false,
    renderAttachment,
    renderAvatar = false,
    showCallout = true
  } = validateProps(carouselLayoutPropsSchema, props);
  const [{ root: filmRootClassName }] = useReactFilmStyleSetClassNames();
  const [direction] = useDirection();
  const [scrollBarWidth] = useScrollBarWidth();
  const [scrolling] = useScrolling();
  const leftSideFlipper = direction === 'rtl' ? '>' : '<';
  const localize = useLocalizer();
  const rightSideFlipper = direction === 'rtl' ? '<' : '>';
  const classNames = useStyles(styles);

  const nextAlt = localize('CAROUSEL_FLIPPER_NEXT_ALT');
  const previousAlt = localize('CAROUSEL_FLIPPER_PREVIOUS_ALT');

  const leftFlipperAriaLabel = direction === 'rtl' ? nextAlt : previousAlt;
  const rightFlipperAriaLabel = direction === 'rtl' ? previousAlt : nextAlt;

  return (
    <div className={cx(classNames['carousel-layout'], filmRootClassName)}>
      <div className={cx('react-film__main', { 'react-film__main--scrolling': scrolling })}>
        <CarouselFilmStrip
          activity={activity}
          hideTimestamp={hideTimestamp}
          renderActivityStatus={renderActivityStatus}
          renderAttachment={renderAttachment}
          renderAvatar={renderAvatar}
          showCallout={showCallout}
        />
        {scrollBarWidth !== '100%' && (
          <React.Fragment>
            <Flipper aria-label={leftFlipperAriaLabel} blurFocusOnClick={true} mode="left">
              {leftSideFlipper}
            </Flipper>
            <Flipper aria-label={rightFlipperAriaLabel} blurFocusOnClick={true} mode="right">
              {rightSideFlipper}
            </Flipper>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

const CarouselLayout = props => {
  const { activity: { attachments = [] } = {} } = validateProps(carouselLayoutPropsSchema, props);
  const [direction] = useDirection();
  const [nonce] = useNonce();
  const filmStyleSet = useMemo(() => createBasicStyleSetForReactFilm({ cursor: null }), []);
  const [{ stylesRoot }] = useStyleOptions();
  const styleOptions = useMemo(() => ({ stylesRoot }), [stylesRoot]);

  return (
    <FilmComposer
      dir={direction}
      nonce={nonce}
      numItems={attachments.length}
      styleOptions={styleOptions}
      styleSet={filmStyleSet}
    >
      <CarouselLayoutCore {...props} />
    </FilmComposer>
  );
};

export default memo(CarouselLayout);
